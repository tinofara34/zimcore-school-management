import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  Student,
  ClassGrade,
  FeeStructure,
  Payment,
  Expense,
  NotificationItem,
  AuditLog,
  StudentBalanceSummary,
  ExpenseCategory,
  PaymentMethod
} from '../types';

interface SchoolContextType {
  students: Student[];
  classes: ClassGrade[];
  feeStructures: FeeStructure[];
  payments: Payment[];
  expenses: Expense[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  loadingData: boolean;

  // Real-time calculated metrics
  totalActiveStudents: number;
  enrolmentsToday: number;
  enrolmentsThisWeek: number;
  enrolmentsThisMonth: number;
  totalFeesCharged: number;
  totalPaymentsCollected: number;
  totalOutstandingFees: number;
  totalExpenses: number;
  netFinancialPosition: number;

  // Helpers
  getStudentBalance: (studentId: string) => StudentBalanceSummary;
  getEnrolmentByClass: () => { className: string; count: number }[];
  getPaymentsByMethod: () => Record<string, number>;
  getExpensesByCategory: () => Record<string, number>;

  // Actions
  registerStudent: (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<string>;
  updateStudent: (studentId: string, updates: Partial<Student>) => Promise<void>;
  recordPayment: (paymentData: {
    studentId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    paymentDate?: string;
  }) => Promise<Payment>;
  reversePayment: (paymentId: string, reason: string) => Promise<void>;
  recordExpense: (expenseData: {
    category: ExpenseCategory;
    amount: number;
    description: string;
    paymentMethod: PaymentMethod;
    reference?: string;
    date?: string;
  }) => Promise<void>;
  reverseExpense: (expenseId: string, reason: string) => Promise<void>;
  addClass: (name: string, capacity?: number, teacher?: string) => Promise<void>;
  addFeeStructure: (fee: Omit<FeeStructure, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  updateSchoolDetails: (details: { name?: string; phone?: string; address?: string; currentTerm?: 'Term 1' | 'Term 2' | 'Term 3'; currentAcademicYear?: string }) => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentSchool, userProfile, currentUser } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassGrade[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Set up real-time listeners whenever currentSchool changes
  useEffect(() => {
    if (!currentSchool || !currentUser || !userProfile) {
      setStudents([]);
      setClasses([]);
      setFeeStructures([]);
      setPayments([]);
      setExpenses([]);
      setNotifications([]);
      setAuditLogs([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    const schoolId = currentSchool.id;

    // 1. Students Listener
    const studentsPath = `schools/${schoolId}/students`;
    const unsubStudents = onSnapshot(
      collection(db, studentsPath),
      (snapshot) => {
        const list: Student[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Student);
        });
        setStudents(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, studentsPath)
    );

    // 2. Classes Listener
    const classesPath = `schools/${schoolId}/classes`;
    const unsubClasses = onSnapshot(
      collection(db, classesPath),
      (snapshot) => {
        const list: ClassGrade[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as ClassGrade);
        });
        setClasses(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, classesPath)
    );

    // 3. Fee Structures Listener
    const feesPath = `schools/${schoolId}/fee_structures`;
    const unsubFees = onSnapshot(
      collection(db, feesPath),
      (snapshot) => {
        const list: FeeStructure[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as FeeStructure);
        });
        setFeeStructures(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, feesPath)
    );

    // 4. Payments Listener
    const paymentsPath = `schools/${schoolId}/payments`;
    const unsubPayments = onSnapshot(
      collection(db, paymentsPath),
      (snapshot) => {
        const list: Payment[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Payment);
        });
        // Sort descending by date
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPayments(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, paymentsPath)
    );

    // 5. Expenses Listener
    const expensesPath = `schools/${schoolId}/expenses`;
    const unsubExpenses = onSnapshot(
      collection(db, expensesPath),
      (snapshot) => {
        const list: Expense[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Expense);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setExpenses(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, expensesPath)
    );

    // 6. Notifications Listener
    const notificationsPath = `schools/${schoolId}/notifications`;
    const unsubNotifications = onSnapshot(
      collection(db, notificationsPath),
      (snapshot) => {
        const list: NotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as NotificationItem);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(list);
      },
      (error) => handleFirestoreError(error, OperationType.GET, notificationsPath)
    );

    // 7. Audit Logs (Only fetched if owner or permitted)
    let unsubAuditLogs = () => {};
    if (userProfile.role === 'owner') {
      const auditPath = `schools/${schoolId}/audit_logs`;
      unsubAuditLogs = onSnapshot(
        collection(db, auditPath),
        (snapshot) => {
          const list: AuditLog[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as AuditLog);
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAuditLogs(list);
        },
        (error) => {
          // If permission fails, fail gracefully without breaking UI
          console.warn('Audit logs permission check:', error);
        }
      );
    }

    setLoadingData(false);

    return () => {
      unsubStudents();
      unsubClasses();
      unsubFees();
      unsubPayments();
      unsubExpenses();
      unsubNotifications();
      unsubAuditLogs();
    };
  }, [currentSchool?.id, currentUser?.uid, userProfile?.role]);

  // Real-time calculations
  const totalActiveStudents = useMemo(() => {
    return students.filter((s) => s.status === 'active').length;
  }, [students]);

  const { enrolmentsToday, enrolmentsThisWeek, enrolmentsThisMonth } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    students.forEach((s) => {
      if (s.status === 'active') {
        const d = new Date(s.enrolmentDate || s.createdAt);
        if (s.enrolmentDate === todayStr || s.createdAt?.slice(0, 10) === todayStr) {
          todayCount++;
        }
        if (d >= startOfWeek) {
          weekCount++;
        }
        if (d >= startOfMonth) {
          monthCount++;
        }
      }
    });

    return {
      enrolmentsToday: todayCount,
      enrolmentsThisWeek: weekCount,
      enrolmentsThisMonth: monthCount
    };
  }, [students]);

  // Balance calculation for individual student
  const getStudentBalance = (studentId: string): StudentBalanceSummary => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return {
        student: {} as Student,
        totalCharged: 0,
        totalPaid: 0,
        balance: 0,
        status: 'unpaid'
      };
    }

    // Calculate charges for this student's class and current academic term/year
    let charged = 0;
    const currentYear = currentSchool?.currentAcademicYear || student.academicYear;
    const currentTerm = currentSchool?.currentTerm || student.termOfAdmission;

    feeStructures.forEach((fee) => {
      const matchesYear = !fee.academicYear || fee.academicYear === currentYear;
      const matchesTerm = !fee.term || fee.term === currentTerm;
      const matchesClass = fee.classId === 'all' || fee.classId === student.classId;

      if (matchesYear && matchesTerm && matchesClass) {
        charged += Number(fee.amount || 0);
      }
    });

    // Deduct custom discount if any
    if (student.customFeeDiscount && student.customFeeDiscount > 0) {
      charged = Math.max(0, charged - Number(student.customFeeDiscount));
    }

    // Sum valid payments (confirmed only)
    const paid = payments
      .filter((p) => p.studentId === studentId && p.status === 'confirmed')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const balance = charged - paid;
    let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (balance <= 0 && charged > 0) {
      status = 'paid';
    } else if (paid > 0 && balance > 0) {
      status = 'partial';
    }

    return {
      student,
      totalCharged: charged,
      totalPaid: paid,
      balance,
      status
    };
  };

  // Aggregate totals
  const totalFeesCharged = useMemo(() => {
    return students
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + getStudentBalance(s.id).totalCharged, 0);
  }, [students, feeStructures, currentSchool?.currentAcademicYear, currentSchool?.currentTerm]);

  const totalPaymentsCollected = useMemo(() => {
    return payments
      .filter((p) => p.status === 'confirmed')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const totalOutstandingFees = useMemo(() => {
    return Math.max(0, totalFeesCharged - totalPaymentsCollected);
  }, [totalFeesCharged, totalPaymentsCollected]);

  const totalExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.status === 'confirmed')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const netFinancialPosition = useMemo(() => {
    return totalPaymentsCollected - totalExpenses;
  }, [totalPaymentsCollected, totalExpenses]);

  // Breakdown helpers
  const getEnrolmentByClass = () => {
    const map: Record<string, number> = {};
    classes.forEach((c) => {
      map[c.name] = 0;
    });

    students.forEach((s) => {
      if (s.status === 'active') {
        const clsName = s.className || 'Unassigned';
        map[clsName] = (map[clsName] || 0) + 1;
      }
    });

    return Object.entries(map).map(([className, count]) => ({ className, count }));
  };

  const getPaymentsByMethod = () => {
    const map: Record<string, number> = {
      cash: 0,
      ecocash: 0,
      bank_transfer: 0,
      swipe: 0,
      other: 0
    };
    payments.forEach((p) => {
      if (p.status === 'confirmed') {
        map[p.paymentMethod] = (map[p.paymentMethod] || 0) + Number(p.amount);
      }
    });
    return map;
  };

  const getExpensesByCategory = () => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      if (e.status === 'confirmed') {
        map[e.category] = (map[e.category] || 0) + Number(e.amount);
      }
    });
    return map;
  };

  // Actions
  const registerStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<string> => {
    if (!currentSchool || !userProfile || !currentUser) throw new Error('Not authenticated');

    // Duplicate admission check
    const existing = students.find((s) => s.admissionNumber.toLowerCase() === studentData.admissionNumber.trim().toLowerCase());
    if (existing) {
      throw new Error(`Admission number "${studentData.admissionNumber}" is already in use by student ${existing.fullName}.`);
    }

    const studentId = 'stu_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const nowIso = new Date().toISOString();

    const record: Student = {
      ...studentData,
      id: studentId,
      createdBy: currentUser.uid,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const studentRef = doc(db, `schools/${currentSchool.id}/students`, studentId);
    await setDoc(studentRef, record);

    // Create Notification for owner
    await setDoc(doc(db, `schools/${currentSchool.id}/notifications`, 'notif_' + Date.now()), {
      title: 'New Student Enrolment',
      message: `${record.fullName} enrolled into ${record.className} by ${userProfile.displayName || userProfile.email}.`,
      type: 'enrolment',
      read: false,
      createdAt: nowIso
    });

    // Audit Log
    await setDoc(doc(db, `schools/${currentSchool.id}/audit_logs`, 'log_' + Date.now()), {
      action: 'student_enrolled',
      entityType: 'student',
      entityId: studentId,
      details: `Enrolled ${record.fullName} (Adm: ${record.admissionNumber}, Class: ${record.className}).`,
      performedBy: currentUser.uid,
      performedByEmail: userProfile.email,
      createdAt: nowIso
    });

    return studentId;
  };

  const updateStudent = async (studentId: string, updates: Partial<Student>) => {
    if (!currentSchool || !userProfile || !currentUser) throw new Error('Not authenticated');

    const nowIso = new Date().toISOString();
    const docRef = doc(db, `schools/${currentSchool.id}/students`, studentId);
    await updateDoc(docRef, { ...updates, updatedAt: nowIso });

    await setDoc(doc(db, `schools/${currentSchool.id}/audit_logs`, 'log_' + Date.now()), {
      action: 'student_updated',
      entityType: 'student',
      entityId: studentId,
      details: `Updated student record. Fields: ${Object.keys(updates).join(', ')}.`,
      performedBy: currentUser.uid,
      performedByEmail: userProfile.email,
      createdAt: nowIso
    });
  };

  const recordPayment = async (paymentData: {
    studentId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    reference?: string;
    paymentDate?: string;
  }): Promise<Payment> => {
    if (!currentSchool || !userProfile || !currentUser) throw new Error('Not authenticated');
    if (paymentData.amount <= 0) throw new Error('Payment amount must be greater than zero.');

    const student = students.find((s) => s.id === paymentData.studentId);
    if (!student) throw new Error('Student not found.');

    const now = new Date();
    const nowIso = now.toISOString();
    const paymentId = 'pay_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    // Generate unique sequential receipt number: REC-2026-0001
    const count = payments.length + 1;
    const year = currentSchool.currentAcademicYear || now.getFullYear().toString();
    const receiptNumber = `REC-${year}-${String(count).padStart(4, '0')}`;

    const newPayment: Payment = {
      id: paymentId,
      receiptNumber,
      studentId: student.id,
      admissionNumber: student.admissionNumber,
      studentName: student.fullName,
      amount: Number(paymentData.amount),
      paymentDate: paymentData.paymentDate || now.toISOString().slice(0, 10),
      paymentMethod: paymentData.paymentMethod,
      reference: paymentData.reference || '',
      term: currentSchool.currentTerm,
      academicYear: currentSchool.currentAcademicYear,
      recordedBy: currentUser.uid,
      recordedByEmail: userProfile.email,
      recordedByName: userProfile.displayName || 'Bursar',
      status: 'confirmed',
      createdAt: nowIso
    };

    const payRef = doc(db, `schools/${currentSchool.id}/payments`, paymentId);
    await setDoc(payRef, newPayment);

    // Create notification
    await setDoc(doc(db, `schools/${currentSchool.id}/notifications`, 'notif_' + Date.now()), {
      title: 'Payment Received',
      message: `${currentSchool.currency} $${newPayment.amount.toFixed(2)} received for ${student.fullName} via ${newPayment.paymentMethod.toUpperCase()} (${newPayment.receiptNumber}).`,
      type: 'payment',
      amount: newPayment.amount,
      read: false,
      createdAt: nowIso
    });

    // Audit log
    await setDoc(doc(db, `schools/${currentSchool.id}/audit_logs`, 'log_' + Date.now()), {
      action: 'payment_recorded',
      entityType: 'payment',
      entityId: paymentId,
      details: `Recorded receipt ${receiptNumber} for ${student.fullName} amount $${newPayment.amount} via ${newPayment.paymentMethod}.`,
      performedBy: currentUser.uid,
      performedByEmail: userProfile.email,
      createdAt: nowIso
    });

    return newPayment;
  };

  const reversePayment = async (paymentId: string, reason: string) => {
    if (!currentSchool || !userProfile || !currentUser) throw new Error('Not authenticated');
    if (!reason.trim()) throw new Error('Reversal reason is required for auditable records.');

    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');

    const nowIso = new Date().toISOString();
    const docRef = doc(db, `schools/${currentSchool.id}/payments`, paymentId);
    await updateDoc(docRef, {
      status: 'reversed',
      reversalReason: reason,
      reversedBy: currentUser.uid
    });

    // Audit log
    await setDoc(doc(db, `schools/${currentSchool.id}/audit_logs`, 'log_' + Date.now()), {
      action: 'payment_reversed',
      entityType: 'payment',
      entityId: paymentId,
      details: `Reversed receipt ${payment.receiptNumber} ($${payment.amount}). Reason: ${reason}.`,
      performedBy: currentUser.uid,
      performedByEmail: userProfile.email,
      createdAt: nowIso
    });
  };

  const recordExpense = async (expenseData: {
    category: ExpenseCategory;
    amount: number;
    description: string;
    paymentMethod: PaymentMethod;
    reference?: string;
    date?: string;
  }) => {
    if (!currentSchool || !userProfile || !currentUser) throw new Error('Not authenticated');
    if (expenseData.amount <= 0) throw new Error('Expense amount must be greater than zero.');

    const nowIso = new Date().toISOString();
    const expenseId = 'exp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    const newExpense: Expense = {
      id: expenseId,
      category: expenseData.category,
      amount: Number(expenseData.amount),
      description: expenseData.description.trim(),
      date: expenseData.date || new Date().toISOString().slice(0, 10),
      paymentMethod: expenseData.paymentMethod,
      reference: expenseData.reference || '',
      recordedBy: currentUser.uid,
      recordedByEmail: userProfile.email,
      status: 'confirmed',
      createdAt: nowIso
    };

    const expRef = doc(db, `schools/${currentSchool.id}/expenses`, expenseId);
    await setDoc(expRef, newExpense);

    // Large expense alert (e.g. >= 200)
    const isLarge = newExpense.amount >= 200;
    await setDoc(doc(db, `schools/${currentSchool.id}/notifications`, 'notif_' + Date.now()), {
      title: isLarge ? 'Large School Expense Recorded' : 'School Expense Recorded',
      message: `${newExpense.category}: $${newExpense.amount.toFixed(2)} recorded by ${userProfile.displayName || userProfile.email}. "${newExpense.description}"`,
      type: isLarge ? 'alert' : 'expense',
      amount: newExpense.amount,
      read: false,
      createdAt: nowIso
    });

    // Audit log
    await setDoc(doc(db, `schools/${currentSchool.id}/audit_logs`, 'log_' + Date.now()), {
      action: 'expense_recorded',
      entityType: 'expense',
      entityId: expenseId,
      details: `Expense $${newExpense.amount} for "${newExpense.description}" (${newExpense.category}) via ${newExpense.paymentMethod}.`,
      performedBy: currentUser.uid,
      performedByEmail: userProfile.email,
      createdAt: nowIso
    });
  };

  const reverseExpense = async (expenseId: string, reason: string) => {
    if (!currentSchool || !userProfile || !currentUser) throw new Error('Not authenticated');
    if (!reason.trim()) throw new Error('Reversal reason is required.');

    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) throw new Error('Expense not found');

    const nowIso = new Date().toISOString();
    const docRef = doc(db, `schools/${currentSchool.id}/expenses`, expenseId);
    await updateDoc(docRef, {
      status: 'reversed',
      reversalReason: reason
    });

    await setDoc(doc(db, `schools/${currentSchool.id}/audit_logs`, 'log_' + Date.now()), {
      action: 'expense_reversed',
      entityType: 'expense',
      entityId: expenseId,
      details: `Reversed expense $${expense.amount} (${expense.category}). Reason: ${reason}.`,
      performedBy: currentUser.uid,
      performedByEmail: userProfile.email,
      createdAt: nowIso
    });
  };

  const addClass = async (name: string, capacity?: number, teacher?: string) => {
    if (!currentSchool || !currentUser || !userProfile) throw new Error('Not authenticated');
    const classId = 'cls_' + Date.now().toString(36);
    const nowIso = new Date().toISOString();

    await setDoc(doc(db, `schools/${currentSchool.id}/classes`, classId), {
      name,
      capacity: capacity || 40,
      classTeacher: teacher || '',
      createdAt: nowIso
    });

    await setDoc(doc(db, `schools/${currentSchool.id}/audit_logs`, 'log_' + Date.now()), {
      action: 'class_created',
      entityType: 'class',
      entityId: classId,
      details: `Created class "${name}".`,
      performedBy: currentUser.uid,
      performedByEmail: userProfile.email,
      createdAt: nowIso
    });
  };

  const addFeeStructure = async (fee: Omit<FeeStructure, 'id' | 'createdAt'>) => {
    if (!currentSchool || !currentUser || !userProfile) throw new Error('Not authenticated');
    const feeId = 'fee_' + Date.now().toString(36);
    const nowIso = new Date().toISOString();

    await setDoc(doc(db, `schools/${currentSchool.id}/fee_structures`, feeId), {
      ...fee,
      createdAt: nowIso
    });

    await setDoc(doc(db, `schools/${currentSchool.id}/audit_logs`, 'log_' + Date.now()), {
      action: 'fee_structure_created',
      entityType: 'fee_structure',
      entityId: feeId,
      details: `Created fee "${fee.title}" ($${fee.amount}) for ${fee.term} ${fee.academicYear}.`,
      performedBy: currentUser.uid,
      performedByEmail: userProfile.email,
      createdAt: nowIso
    });
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!currentSchool) return;
    const docRef = doc(db, `schools/${currentSchool.id}/notifications`, notificationId);
    await updateDoc(docRef, { read: true });
  };

  const updateSchoolDetails = async (details: {
    name?: string;
    phone?: string;
    address?: string;
    currentTerm?: 'Term 1' | 'Term 2' | 'Term 3';
    currentAcademicYear?: string;
  }) => {
    if (!currentSchool || !currentUser || !userProfile) throw new Error('Not authenticated');
    const nowIso = new Date().toISOString();
    const docRef = doc(db, 'schools', currentSchool.id);
    await updateDoc(docRef, { ...details, updatedAt: nowIso });

    await setDoc(doc(db, `schools/${currentSchool.id}/audit_logs`, 'log_' + Date.now()), {
      action: 'school_updated',
      entityType: 'school',
      entityId: currentSchool.id,
      details: `Updated school settings: ${Object.keys(details).join(', ')}.`,
      performedBy: currentUser.uid,
      performedByEmail: userProfile.email,
      createdAt: nowIso
    });
  };

  return (
    <SchoolContext.Provider
      value={{
        students,
        classes,
        feeStructures,
        payments,
        expenses,
        notifications,
        auditLogs,
        loadingData,
        totalActiveStudents,
        enrolmentsToday,
        enrolmentsThisWeek,
        enrolmentsThisMonth,
        totalFeesCharged,
        totalPaymentsCollected,
        totalOutstandingFees,
        totalExpenses,
        netFinancialPosition,
        getStudentBalance,
        getEnrolmentByClass,
        getPaymentsByMethod,
        getExpensesByCategory,
        registerStudent,
        updateStudent,
        recordPayment,
        reversePayment,
        recordExpense,
        reverseExpense,
        addClass,
        addFeeStructure,
        markNotificationAsRead,
        updateSchoolDetails
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
