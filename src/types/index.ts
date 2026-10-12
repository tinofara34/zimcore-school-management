export type UserRole = 'owner' | 'bursar';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  schoolId: string;
  createdAt: string;
}

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'grace_period';

export interface School {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  phone: string;
  address: string;
  currency: 'USD' | 'ZiG';
  currentAcademicYear: string;
  currentTerm: 'Term 1' | 'Term 2' | 'Term 3';
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiryDate: string;
  bursarEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassGrade {
  id: string;
  name: string;
  capacity?: number;
  classTeacher?: string;
  createdAt: string;
}

export type StudentStatus = 'active' | 'transferred' | 'withdrawn';

export interface Student {
  id: string;
  admissionNumber: string;
  fullName: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other';
  classId: string;
  className: string;
  academicYear: string;
  termOfAdmission: 'Term 1' | 'Term 2' | 'Term 3';
  enrolmentDate: string;
  guardianName: string;
  guardianPhone: string;
  guardianAddress?: string;
  status: StudentStatus;
  customFeeDiscount?: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeStructure {
  id: string;
  title: string;
  classId: string; // 'all' or specific class ID
  academicYear: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  amount: number;
  mandatory: boolean;
  createdAt: string;
}

export type PaymentMethod = 'cash' | 'ecocash' | 'bank_transfer' | 'swipe' | 'other';
export type TransactionStatus = 'confirmed' | 'reversed';

export interface Payment {
  id: string;
  receiptNumber: string;
  studentId: string;
  admissionNumber: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
  academicYear: string;
  recordedBy: string;
  recordedByEmail: string;
  recordedByName: string;
  status: TransactionStatus;
  reversalReason?: string;
  reversedBy?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'Salaries & Wages'
  | 'Teaching Materials'
  | 'Utilities'
  | 'Repairs & Maintenance'
  | 'Transport'
  | 'Office Supplies'
  | 'School Equipment'
  | 'Other Approved';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  recordedBy: string;
  recordedByEmail: string;
  status: TransactionStatus;
  reversalReason?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'enrolment' | 'payment' | 'expense' | 'alert';
  amount?: number;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'student' | 'payment' | 'expense' | 'class' | 'fee_structure' | 'school' | 'bursar';
  entityId: string;
  details: string;
  performedBy: string;
  performedByEmail: string;
  createdAt: string;
}

export interface StudentBalanceSummary {
  student: Student;
  totalCharged: number;
  totalPaid: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid';
}
