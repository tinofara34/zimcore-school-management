import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  UserPlus,
  Receipt,
  TrendingDown,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { RecordPaymentModal } from '../finance/RecordPaymentModal';
import { RecordExpenseModal } from '../finance/RecordExpenseModal';
import { StudentFormModal } from '../students/StudentFormModal';
import { ReceiptModal } from '../finance/ReceiptModal';
import { Payment, Student } from '../../types';

export const BursarDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentSchool } = useAuth();
  const {
    students,
    payments,
    expenses,
    getStudentBalance,
    totalActiveStudents
  } = useSchool();

  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<Student | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Today's collections
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPayments = payments.filter(
    (p) => (p.paymentDate === todayStr || p.createdAt.slice(0, 10) === todayStr) && p.status === 'confirmed'
  );

  const todayTotal = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Filter students for fast search
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return students
      .filter(
        (s) =>
          s.status === 'active' &&
          (s.fullName.toLowerCase().includes(term) || s.admissionNumber.toLowerCase().includes(term))
      )
      .slice(0, 6);
  }, [students, searchTerm]);

  const handleStartPayment = (student?: Student) => {
    setSelectedStudentForPay(student || null);
    setShowPaymentModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Bursar Operational Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-2">
              <Clock className="w-3.5 h-3.5" />
              Bursar Administration Desk
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Daily Operations Desk
            </h1>
            <p className="text-slate-300 text-sm mt-0.5">
              School: <span className="text-white font-semibold">{currentSchool?.name}</span> • Term: {currentSchool?.currentTerm} ({currentSchool?.currentAcademicYear})
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleStartPayment()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Record Student Payment
            </button>
            <button
              onClick={() => setShowStudentModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Register Student
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition flex items-center gap-2"
            >
              <TrendingDown className="w-4 h-4 text-rose-400" />
              Record Expense
            </button>
          </div>
        </div>
      </div>

      {/* Operational Stats for Today */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Collections */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Today's Total Collections</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            ${todayTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {todayPayments.length} receipt{todayPayments.length === 1 ? '' : 's'} issued today
          </div>
        </div>

        {/* Active Enrolment */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
            <span>Enrolled Students</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {totalActiveStudents}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Active school roster count
          </div>
        </div>

        {/* Quick Collections Link */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="text-xs text-slate-400 font-semibold uppercase">
            Daily Operational Report
          </div>
          <div className="my-2">
            <button
              onClick={() => onNavigate('daily_report')}
              className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
            >
              <span>View Today's Audit Slip</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[11px] text-slate-500">
            Print end-of-day cash reconciliation for owner
          </div>
        </div>
      </div>

      {/* Fast Student Search & Balance Check Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-400" />
            Fast Student Search & Balance Lookup
          </h2>
          <span className="text-xs text-slate-400">Search by student name or admission number</span>
        </div>

        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Type student name (e.g. Tendai) or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Live Search Results */}
        {searchTerm.trim() && (
          <div className="mt-3 divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
            {filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No active student found matching "{searchTerm}".
              </div>
            ) : (
              filteredStudents.map((s) => {
                const bal = getStudentBalance(s.id);
                return (
                  <div
                    key={s.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{s.fullName}</div>
                      <div className="text-[11px] text-slate-400">
                        Adm: <span className="font-mono text-slate-300">{s.admissionNumber}</span> • Class: {s.className}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Balance:</div>
                        <div
                          className={`font-bold ${
                            bal.balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          ${bal.balance.toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartPayment(s)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition"
                      >
                        Record Payment
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Today's Transactions Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Today's Issued Receipts</h2>
          </div>
          <button
            onClick={() => onNavigate('payments')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            All Payment Records ({payments.length})
          </button>
        </div>

        {todayPayments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No payments have been recorded yet today. Click "Record Student Payment" above to issue a receipt.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-medium">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Receipt #</th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {todayPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-medium text-blue-300">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{p.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.admissionNumber}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{p.term}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="text-blue-400 hover:text-blue-300 font-semibold text-xs px-2.5 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 flex items-center gap-1 ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <RecordPaymentModal
          preselectedStudent={selectedStudentForPay}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedStudentForPay(null);
          }}
          onSuccess={(payment) => {
            setShowPaymentModal(false);
            setSelectedStudentForPay(null);
            setSelectedReceipt(payment);
          }}
        />
      )}

      {showExpenseModal && (
        <RecordExpenseModal
          onClose={() => setShowExpenseModal(false)}
        />
      )}

      {showStudentModal && (
        <StudentFormModal
          onClose={() => setShowStudentModal(false)}
        />
      )}

      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
