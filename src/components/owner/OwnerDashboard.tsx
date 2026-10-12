import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  UserPlus,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Calendar,
  Sparkles,
  CheckCircle,
  Clock,
  Printer
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { ReceiptModal } from '../finance/ReceiptModal';
import { Payment } from '../../types';

export const OwnerDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { currentSchool } = useAuth();
  const {
    students,
    payments,
    expenses,
    classes,
    totalActiveStudents,
    enrolmentsToday,
    enrolmentsThisMonth,
    totalFeesCharged,
    totalPaymentsCollected,
    totalOutstandingFees,
    totalExpenses,
    netFinancialPosition,
    getEnrolmentByClass,
    getStudentBalance
  } = useSchool();

  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [termFilter, setTermFilter] = useState<string>('all');

  const currency = currentSchool?.currency || 'USD';

  // Recent transactions
  const recentPayments = payments.slice(0, 5);
  const recentExpenses = expenses.slice(0, 5);
  const recentStudents = students
    .filter((s) => s.status === 'active')
    .slice(0, 5);

  // Highest outstanding balances (debtors)
  const topDebtors = students
    .filter((s) => s.status === 'active')
    .map((s) => getStudentBalance(s.id))
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  const enrolmentData = getEnrolmentByClass();

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Live Remote Executive Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {currentSchool?.name || 'School Dashboard'}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Real-time synchronization active. Any transaction entered by the bursar at school updates immediately here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Generate Reports
            </button>
            <button
              onClick={() => onNavigate('payments')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              View All Collections
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fees Charged */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Total Fees Charged</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            ${totalFeesCharged.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Total expected based on enrolled students & class fee schedules
          </div>
        </div>

        {/* Total Payments Collected */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Collected Cash</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            ${totalPaymentsCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">
              {totalFeesCharged > 0 ? ((totalPaymentsCollected / totalFeesCharged) * 100).toFixed(1) : 0}%
            </span>
            <span>of total billed tuition received</span>
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Outstanding Fees</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-400">
            ${totalOutstandingFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Unpaid school fees currently pending recovery
          </div>
        </div>

        {/* Net Recorded Financial Position */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
            <span>Net Financial Position</span>
            <div className={`p-2 rounded-lg ${netFinancialPosition >= 0 ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-2 text-2xl font-black ${netFinancialPosition >= 0 ? 'text-teal-300' : 'text-amber-400'}`}>
            ${netFinancialPosition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Cash collected minus ${totalExpenses.toLocaleString()} total expenses
          </div>
        </div>
      </div>

      {/* Enrolment Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Total Active Students</div>
            <div className="text-xl font-extrabold text-white">{totalActiveStudents}</div>
            <div className="text-[11px] text-slate-400">Currently enrolled & attending</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center font-bold">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Enrolled Today</div>
            <div className="text-xl font-extrabold text-white">{enrolmentsToday}</div>
            <div className="text-[11px] text-slate-400">Admissions processed today</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Enrolled This Month</div>
            <div className="text-xl font-extrabold text-white">{enrolmentsThisMonth}</div>
            <div className="text-[11px] text-slate-400">Month-to-date total additions</div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Recent Payments & Enrolment By Class */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Recent Collections */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Live Collections Stream</h2>
              </div>
              <button
                onClick={() => onNavigate('payments')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                View all ({payments.length})
              </button>
            </div>

            {recentPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No payments recorded yet. When the bursar collects school fees, receipts will appear here instantly.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-medium">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Receipt #</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {recentPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-medium text-blue-300">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white">{p.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{p.admissionNumber}</div>
                        </td>
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
                            className="text-blue-400 hover:text-blue-300 font-semibold text-xs px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20"
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Enrolment Distribution by Class */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Enrolment by Class & Grade</h2>
              </div>
              <button
                onClick={() => onNavigate('classes')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                Manage Classes
              </button>
            </div>

            {enrolmentData.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                No classes registered yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {enrolmentData.map(({ className, count }) => (
                  <div
                    key={className}
                    className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-xs truncate max-w-[90px]">{className}</div>
                      <div className="text-[10px] text-slate-400">Students</div>
                    </div>
                    <div className="text-lg font-black text-blue-400">{count}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Top Outstanding Balances & Recent Expenses */}
        <div className="space-y-6">
          {/* Top Outstanding Balances (Debtors) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Top Outstanding Balances</h3>
              </div>
              <button
                onClick={() => onNavigate('reports')}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
              >
                Debtors List
              </button>
            </div>

            {topDebtors.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                All enrolled students are fully up to date with fees!
              </div>
            ) : (
              <div className="space-y-2.5">
                {topDebtors.map(({ student, balance, totalCharged, totalPaid }) => (
                  <div
                    key={student.id}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{student.fullName}</div>
                      <div className="text-[11px] text-slate-400">
                        {student.className} • Adm: {student.admissionNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-rose-400">${balance.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">Paid: ${totalPaid.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Expenses */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Recent School Expenses</h3>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
              >
                View all ({expenses.length})
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No expenses recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{exp.category}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {exp.description}
                      </div>
                    </div>
                    <div className="text-right font-bold text-rose-400">
                      -${exp.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal if selected */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
