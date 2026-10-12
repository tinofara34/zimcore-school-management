import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import { UserProfile, School, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  currentSchool: School | null;
  loading: boolean;
  connectionStatus: { connected: boolean; message: string };
  signInWithGoogle: () => Promise<FirebaseUser>;
  registerSchoolAndOwner: (schoolName: string, phone: string, address: string, academicYear: string, term: 'Term 1' | 'Term 2' | 'Term 3') => Promise<void>;
  joinAsBursar: (schoolId: string, bursarName: string) => Promise<void>;
  switchRoleForTesting: (role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Connecting to database...'
  });

  const isRegisteringRef = useRef(false);

  // Verify connection once on boot
  useEffect(() => {
    testConnection().then((status) => {
      setConnectionStatus(status);
    });
  }, []);

  const fetchProfileAndSchool = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        setUserProfile(data);

        if (data.schoolId) {
          const schoolDocRef = doc(db, 'schools', data.schoolId);
          const schoolSnap = await getDoc(schoolDocRef);
          if (schoolSnap.exists()) {
            setCurrentSchool({ id: schoolSnap.id, ...schoolSnap.data() } as School);
          }
        }
      } else {
        setUserProfile(null);
        setCurrentSchool(null);
      }
    } catch (err) {
      console.warn('Initial profile lookup for user:', err);
      setUserProfile(null);
      setCurrentSchool(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        if (!isRegisteringRef.current) {
          await fetchProfileAndSchool(user.uid);
        }
      } else {
        setUserProfile(null);
        setCurrentSchool(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      setCurrentUser(res.user);
      await fetchProfileAndSchool(res.user.uid);
      return res.user;
    } catch (error: any) {
      console.error('Authentication error:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please complete authentication to continue.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerSchoolAndOwner = async (
    schoolName: string,
    phone: string,
    address: string,
    academicYear: string,
    term: 'Term 1' | 'Term 2' | 'Term 3'
  ) => {
    setLoading(true);
    isRegisteringRef.current = true;
    try {
      let user = auth.currentUser;
      if (!user) {
        // Trigger Google Sign-in if not signed in yet
        const res = await signInWithPopup(auth, googleProvider);
        user = res.user;
        setCurrentUser(user);
      }

      const schoolId = 'school_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const nowIso = new Date().toISOString();
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 90); // 90 days active trial

      const userEmail = user.email || 'owner@zimcore.co.zw';
      const userDisplayName = user.displayName || 'School Owner';

      // 1. Prepare User Profile
      const userProfileData: UserProfile = {
        uid: user.uid,
        email: userEmail,
        displayName: userDisplayName,
        role: 'owner',
        schoolId: schoolId,
        createdAt: nowIso
      };

      // 2. Prepare School Document
      const schoolData: Omit<School, 'id'> = {
        name: schoolName,
        ownerId: user.uid,
        ownerEmail: userEmail,
        phone: phone || '+263 77 123 4567',
        address: address || 'Harare, Zimbabwe',
        currency: 'USD',
        currentAcademicYear: academicYear || new Date().getFullYear().toString(),
        currentTerm: term || 'Term 1',
        subscriptionStatus: 'active',
        subscriptionExpiryDate: expiry.toISOString(),
        createdAt: nowIso,
        updatedAt: nowIso
      };

      // 3. Use an atomic batch to write user, school, classes, and fee structures in ONE round-trip
      const batch = writeBatch(db);

      batch.set(doc(db, 'users', user.uid), userProfileData);
      batch.set(doc(db, 'schools', schoolId), schoolData);

      // Seed standard Zimbabwean default classes
      const defaultClasses = [
        'ECD A', 'ECD B', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4',
        'Grade 5', 'Grade 6', 'Grade 7', 'Form 1', 'Form 2', 'Form 3', 'Form 4'
      ];

      for (const clsName of defaultClasses) {
        const classId = 'cls_' + clsName.toLowerCase().replace(/\s+/g, '_');
        batch.set(doc(db, `schools/${schoolId}/classes`, classId), {
          name: clsName,
          capacity: 35,
          classTeacher: 'Assigned Teacher',
          createdAt: nowIso
        });
      }

      // Seed default tuition fee structure
      const feeId = 'fee_term1_tuition';
      batch.set(doc(db, `schools/${schoolId}/fee_structures`, feeId), {
        title: `${term} General Tuition`,
        classId: 'all',
        academicYear: academicYear,
        term: term,
        amount: 250,
        mandatory: true,
        createdAt: nowIso
      });

      // Audit Log
      batch.set(doc(db, `schools/${schoolId}/audit_logs`, 'log_' + Date.now()), {
        action: 'school_registered',
        entityType: 'school',
        entityId: schoolId,
        details: `School "${schoolName}" registered by owner ${userEmail}.`,
        performedBy: user.uid,
        performedByEmail: userEmail,
        createdAt: nowIso
      });

      // Commit the atomic batch
      await batch.commit();

      setUserProfile(userProfileData);
      setCurrentSchool({ id: schoolId, ...schoolData });
    } catch (err: any) {
      console.error('Error registering school:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please complete authentication to register your school.');
      }
      handleFirestoreError(err, OperationType.WRITE, 'schools');
    } finally {
      isRegisteringRef.current = false;
      setLoading(false);
    }
  };

  const joinAsBursar = async (schoolId: string, bursarName: string) => {
    setLoading(true);
    isRegisteringRef.current = true;
    try {
      let user = auth.currentUser;
      if (!user) {
        const res = await signInWithPopup(auth, googleProvider);
        user = res.user;
        setCurrentUser(user);
      }

      const schoolSnap = await getDoc(doc(db, 'schools', schoolId));
      if (!schoolSnap.exists()) {
        throw new Error('School not found with the provided ID. Please verify with your School Owner.');
      }

      const nowIso = new Date().toISOString();
      const userEmail = user.email || `bursar_${user.uid.slice(0, 5)}@zimcore.co.zw`;
      const displayName = bursarName || user.displayName || 'School Bursar';

      const userProfileData: UserProfile = {
        uid: user.uid,
        email: userEmail,
        displayName: displayName,
        role: 'bursar',
        schoolId: schoolId,
        createdAt: nowIso
      };

      const batch = writeBatch(db);
      batch.set(doc(db, 'users', user.uid), userProfileData);

      // Record audit log
      batch.set(doc(db, `schools/${schoolId}/audit_logs`, 'log_' + Date.now()), {
        action: 'bursar_joined',
        entityType: 'bursar',
        entityId: user.uid,
        details: `Bursar ${displayName} joined school administration.`,
        performedBy: user.uid,
        performedByEmail: userEmail,
        createdAt: nowIso
      });

      await batch.commit();

      setUserProfile(userProfileData);
      setCurrentSchool({ id: schoolSnap.id, ...schoolSnap.data() } as School);
    } catch (err: any) {
      console.error('Error joining as bursar:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please complete authentication to join as Bursar.');
      }
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      isRegisteringRef.current = false;
      setLoading(false);
    }
  };

  const switchRoleForTesting = async (role: UserRole) => {
    if (!currentUser || !userProfile || !currentSchool) return;
    setLoading(true);
    try {
      const updatedProfile: UserProfile = {
        ...userProfile,
        role: role,
        displayName: role === 'owner' ? 'School Owner' : 'School Bursar'
      };
      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);
      setUserProfile(updatedProfile);
    } catch (err) {
      console.error('Error switching test role:', err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfileAndSchool(currentUser.uid);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await fbSignOut(auth);
      setUserProfile(null);
      setCurrentSchool(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        currentSchool,
        loading,
        connectionStatus,
        signInWithGoogle,
        registerSchoolAndOwner,
        joinAsBursar,
        switchRoleForTesting,
        signOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
