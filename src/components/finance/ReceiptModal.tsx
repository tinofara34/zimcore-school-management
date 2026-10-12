import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Payment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';

interface ReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ payment, onClose }) => {
  const { currentSchool } = useAuth();
  const { getStudentBalance } = useSchool();

  const bal = getStudentBalance(payment.studentId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Top Control Bar (Screen Only) */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 print:hidden">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Official Payment Receipt
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 space-y-6 bg-slate-900 print:bg-white print:p-6 text-slate-100 print:text-slate-900 font-sans">
          {/* Header */}
          <div className="text-center border-b border-slate-800 print:border-slate-300 pb-5">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 print:text-emerald-700 flex items-center justify-center font-bold text-xl mb-2">
              ZC
            </div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white print:text-slate-900">
              {currentSchool?.name || 'Zimcore School'}
            </h1>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              {currentSchool?.address || 'Harare, Zimbabwe'} • Tel: {currentSchool?.phone || '+263 77 123 4567'}
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-slate-800 print:bg-slate-100 rounded-md text-xs font-mono font-bold tracking-widest uppercase text-slate-200 print:text-slate-800 border border-slate-700 print:border-slate-300">
              OFFICIAL RECEIPT
            </div>
          </div>

          {/* Receipt Meta & Student Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 print:text-slate-500 text-[11px] block">Receipt Number</span>
              <span className="font-mono font-bold text-blue-400 print:text-blue-700 text-sm">
                {payment.receiptNumber}
              </span>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-slate-400 print:text-slate-500 text-[11px] block">Date & Time</span>
              <span className="font-medium">
                {payment.paymentDate} • {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-800/80 print:border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 print:text-slate-500 text-[11px] block">Student Name</span>
                <span className="font-bold text-white print:text-slate-900 text-sm">
                  {payment.studentName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 print:text-slate-500 text-[11px] block">Admission Number</span>
                <span className="font-mono font-semibold text-slate-200 print:text-slate-800">
                  {payment.admissionNumber}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 print:text-slate-500 text-[11px] block">Period / Term</span>
              <span className="font-medium text-slate-300 print:text-slate-700">
                {payment.term} • {payment.academicYear}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 print:text-slate-500 text-[11px] block">Payment Method</span>
              <span className="capitalize font-semibold text-slate-200 print:text-slate-800">
                {payment.paymentMethod} {payment.reference ? `(${payment.reference})` : ''}
              </span>
            </div>
          </div>

          {/* Amount Paid Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 print:bg-slate-50 border border-slate-800 print:border-slate-300 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 print:text-slate-600 uppercase tracking-wider">
                Amount Received
              </div>
              <div className="text-[11px] text-slate-500 print:text-slate-600">
                Currency: United States Dollars (USD)
              </div>
            </div>
            <div className="text-3xl font-black text-emerald-400 print:text-emerald-700">
              ${payment.amount.toFixed(2)}
            </div>
          </div>

          {/* Balance Statement */}
          <div className="p-3 rounded-lg bg-slate-800/40 print:bg-slate-100 border border-slate-800 print:border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-300 print:text-slate-700 font-medium">
              Student Remaining Balance:
            </span>
            <span
              className={`font-bold font-mono text-sm ${
                bal.balance > 0 ? 'text-rose-400 print:text-rose-700' : 'text-emerald-400 print:text-emerald-700'
              }`}
            >
              ${bal.balance.toFixed(2)} USD
            </span>
          </div>

          {/* Issuer details & Stamp area */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 grid grid-cols-2 gap-6 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 print:text-slate-500 uppercase">Received By</p>
              <p className="font-bold text-white print:text-slate-900">{payment.recordedByName || 'School Bursar'}</p>
              <p className="text-[11px] text-slate-400 print:text-slate-500">{payment.recordedByEmail}</p>
            </div>

            <div className="text-center border border-dashed border-slate-700 print:border-slate-400 rounded-lg p-2 flex flex-col justify-center items-center h-20">
              <span className="text-[10px] font-semibold text-slate-400 print:text-slate-600 uppercase tracking-widest">
                Official School Stamp
              </span>
              <span className="text-[9px] text-slate-500 print:text-slate-400 italic">
                Valid with authorized signature
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2 text-[10px] text-slate-500 print:text-slate-500 italic">
            Thank you for your payment. Please preserve this receipt for your records. Generated via Zimcore School Management System.
          </div>
        </div>
      </div>
    </div>
  );
};
