import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Edit,
  Phone,
  Calendar,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Student, Payment } from '../../types';
import { StudentFormModal } from './StudentFormModal';
import { ReceiptModal } from '../finance/ReceiptModal';

interface StudentProfileModalProps {
  student: Student;
  onClose: () => void;
  onRecordPayment: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onRecordPayment
}) => {
  const { getStudentBalance, payments } = useSchool();
  const { currentSchool } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const bal = getStudentBalance(student.id);

  // Filter payments for this specific student
  const studentPayments = payments.filter((p) => p.studentId === student.id);

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:bg-white print:text-black">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 print:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{student.fullName}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                    {student.admissionNumber}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {student.className} • Enrolled: {student.termOfAdmission} ({student.academicYear})
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                title="Edit Student Information"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable School Header (Only in Print Mode) */}
          <div className="hidden print:block p-6 border-b text-center">
            <h1 className="text-2xl font-black uppercase text-slate-900 tracking-wider">
              {currentSchool?.name}
            </h1>
            <p className="text-xs text-slate-600">
              {currentSchool?.address} • Phone: {currentSchool?.phone}
            </p>
            <div className="mt-4 py-1 border-y border-slate-300 font-bold text-sm tracking-wide uppercase">
              Official Student Financial Statement & Clearance Slip
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Student Basic Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs print:bg-slate-50 print:border-slate-200 print:text-black">
              <div>
                <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Class</span>
                <span className="font-bold text-white print:text-black">{student.className}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Gender</span>
                <span className="font-bold text-white print:text-black">{student.gender || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Enrolment Status</span>
                <span className="font-bold uppercase text-emerald-400 print:text-black">{student.status}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">Admission Date</span>
                <span className="font-bold text-white print:text-black">{student.enrolmentDate || student.createdAt.slice(0, 10)}</span>
              </div>
            </div>

            {/* Financial Status Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center print:border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Charged</div>
                <div className="text-lg font-black text-white mt-1 print:text-black">
                  ${bal.totalCharged.toFixed(2)}
                </div>
                {student.customFeeDiscount ? (
                  <div className="text-[10px] text-blue-400 mt-0.5">
                    Includes ${student.customFeeDiscount} bursary
                  </div>
                ) : null}
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center print:border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Paid</div>
                <div className="text-lg font-black text-emerald-400 mt-1 print:text-black">
                  ${bal.totalPaid.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {studentPayments.length} valid receipt{studentPayments.length === 1 ? '' : 's'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center print:border-slate-200">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Balance</div>
                <div
                  className={`text-lg font-black mt-1 ${
                    bal.balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                  } print:text-black`}
                >
                  ${bal.balance.toFixed(2)}
                </div>
                <div className="text-[10px] font-semibold uppercase mt-0.5">
                  {bal.balance <= 0 ? 'Fully Cleared' : 'Payment Due'}
                </div>
              </div>
            </div>

            {/* Guardian & Emergency Contacts */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2 text-xs">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300 print:text-black">
                Guardian Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 print:text-black">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Guardian: <strong className="text-white print:text-black">{student.guardianName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Phone: <strong className="text-white print:text-black">{student.guardianPhone}</strong></span>
                </div>
                {student.guardianAddress && (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Address: {student.guardianAddress}</span>
                  </div>
                )}
                {student.notes && (
                  <div className="sm:col-span-2 text-slate-400 italic text-[11px] pt-1">
                    Notes: {student.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Payment History Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300 print:text-black">
                  Fee Payment History
                </h3>
                <span className="text-xs text-slate-400 print:text-black">
                  {studentPayments.length} recorded transaction(s)
                </span>
              </div>

              {studentPayments.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
                  No payment records found for this student.
                </div>
              ) : (
                <div className="border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase font-medium print:bg-slate-100 print:text-black">
                      <tr>
                        <th className="py-2.5 px-3">Receipt #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Method</th>
                        <th className="py-2.5 px-3">Ref</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right print:hidden">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300 print:divide-slate-200 print:text-black">
                      {studentPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 px-3 font-mono text-blue-300 font-semibold print:text-black">
                            {p.receiptNumber}
                          </td>
                          <td className="py-2 px-3">{p.paymentDate}</td>
                          <td className="py-2 px-3 capitalize">{p.paymentMethod}</td>
                          <td className="py-2 px-3 font-mono text-[11px]">{p.reference || '-'}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400 print:text-black">
                            ${p.amount.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right print:hidden">
                            <button
                              onClick={() => setSelectedReceipt(p)}
                              className="text-blue-400 hover:text-blue-300 font-semibold text-xs px-2 py-0.5 rounded bg-blue-500/10"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Print Signatures Block (Only visible on Print) */}
            <div className="hidden print:grid grid-cols-2 gap-8 pt-12 text-xs">
              <div className="border-t border-slate-400 pt-2 text-center">
                <p className="font-bold">Bursar / Accounts Signature</p>
                <p className="text-[10px] text-slate-500">Official Zimcore Stamp</p>
              </div>
              <div className="border-t border-slate-400 pt-2 text-center">
                <p className="font-bold">Head / School Owner Signature</p>
                <p className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between print:hidden">
            <button
              onClick={handlePrintStatement}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              Print Statement
            </button>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
              <button
                onClick={onRecordPayment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <StudentFormModal
          studentToEdit={student}
          onClose={() => setIsEditing(false)}
        />
      )}

      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </>
  );
};
