import React, { useState, useMemo } from 'react';
import {
  FileBarChart,
  Printer,
  FileSpreadsheet,
  Calendar,
  Users,
  DollarSign,
  TrendingDown,
  CreditCard,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

export const ReportsView: React.FC<{ defaultReport?: string }> = ({ defaultReport = 'collections' }) => {
  const {
    students,
    payments,
    expenses,
    classes,
    getStudentBalance,
    getEnrolmentByClass,
    getExpensesByCategory,
    totalFeesCharged,
    totalPaymentsCollected,
    totalOutstandingFees,
    totalExpenses,
    netFinancialPosition
  } = useSchool();
  const { currentSchool, userProfile } = useAuth();

  const isOwner = userProfile?.role === 'owner';
  const [activeReport, setActiveReport] = useState<string>(
    !isOwner && defaultReport === 'collections' ? 'daily' : defaultReport
  );

  // Date filters
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'this_week' | 'this_month' | 'term' | 'all'>('term');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter payments by period
  const filteredPayments = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return payments.filter((p) => {
      if (p.status !== 'confirmed') return false;
      const d = new Date(p.paymentDate || p.createdAt);

      if (filterPeriod === 'today') {
        return p.paymentDate === todayStr || p.createdAt.slice(0, 10) === todayStr;
      }
      if (filterPeriod === 'this_week') {
        return d >= startOfWeek;
      }
      if (filterPeriod === 'this_month') {
        return d >= startOfMonth;
      }
      if (filterPeriod === 'term') {
        return p.term === currentSchool?.currentTerm;
      }
      return true;
    });
  }, [payments, filterPeriod, todayStr, currentSchool?.currentTerm]);

  const collectionsTotal = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Student balance breakdown
  const studentBalanceList = useMemo(() => {
    return students
      .filter((s) => s.status === 'active')
      .map((s) => getStudentBalance(s.id));
  }, [students, getStudentBalance]);

  const fullyPaidCount = studentBalanceList.filter((b) => b.status === 'paid').length;
  const partialPaidCount = studentBalanceList.filter((b) => b.status === 'partial').length;
  const unpaidCount = studentBalanceList.filter((b) => b.status === 'unpaid').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeReport === 'collections' || activeReport === 'daily') {
      headers = ['Receipt #', 'Student Name', 'Admission #', 'Amount', 'Method', 'Date', 'Term', 'Recorded By'];
      rows = filteredPayments.map((p) => [
        `"${p.receiptNumber}"`,
        `"${p.studentName}"`,
        `"${p.admissionNumber}"`,
        p.amount.toFixed(2),
        `"${p.paymentMethod}"`,
        `"${p.paymentDate}"`,
        `"${p.term}"`,
        `"${p.recordedByName || p.recordedByEmail}"`
      ]);
    } else if (activeReport === 'debtors') {
      headers = ['Admission #', 'Student Name', 'Class', 'Guardian', 'Phone', 'Total Billed', 'Total Paid', 'Outstanding Balance'];
      rows = studentBalanceList
        .filter((b) => b.balance > 0)
        .map((b) => [
          `"${b.student.admissionNumber}"`,
          `"${b.student.fullName}"`,
          `"${b.student.className}"`,
          `"${b.student.guardianName}"`,
          `"${b.student.guardianPhone}"`,
          b.totalCharged.toFixed(2),
          b.totalPaid.toFixed(2),
          b.balance.toFixed(2)
        ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zimcore_${activeReport}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-blue-400" />
            Financial & Administrative Reports
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Real-time auditable school reports for {currentSchool?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 print:hidden">
        <button
          onClick={() => setActiveReport('collections')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeReport === 'collections'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          Fee Collections Breakdown
        </button>
        <button
          onClick={() => setActiveReport('debtors')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeReport === 'debtors'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          Outstanding Debtors List
        </button>
        <button
          onClick={() => setActiveReport('enrolment')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeReport === 'enrolment'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          Enrolment by Class & Roster
        </button>
        {isOwner && (
          <button
            onClick={() => setActiveReport('cashflow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeReport === 'cashflow'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Cashflow Statement (Net Position)
          </button>
        )}
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-black uppercase text-slate-900 tracking-wider">
          {currentSchool?.name}
        </h1>
        <p className="text-xs text-slate-600">
          {currentSchool?.address} • Phone: {currentSchool?.phone}
        </p>
        <h2 className="text-sm font-bold mt-2 uppercase tracking-wide text-slate-800">
          Official Report: {activeReport.toUpperCase()} • Generated on {new Date().toLocaleDateString()}
        </h2>
      </div>

      {/* REPORT 1: COLLECTIONS */}
      {activeReport === 'collections' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl print:hidden">
            <span className="text-xs text-slate-300 font-semibold">Filter Collection Window:</span>
            <div className="flex flex-wrap gap-1.5">
              {(['today', 'this_week', 'this_month', 'term', 'all'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition ${
                    filterPeriod === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 print:border-slate-300">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Window Collections</div>
              <div className="text-2xl font-black text-emerald-400 print:text-black mt-1">
                ${collectionsTotal.toFixed(2)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {filteredPayments.length} verified receipts issued
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 print:border-slate-300">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Paid Status Breakdown</div>
              <div className="text-xs text-slate-300 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Fully Paid Students:</span>
                  <strong className="text-emerald-400">{fullyPaidCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Partially Paid:</span>
                  <strong className="text-amber-400">{partialPaidCount}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 print:border-slate-300">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Unpaid Students</div>
              <div className="text-2xl font-black text-rose-400 print:text-black mt-1">
                {unpaidCount}
              </div>
              <div className="text-xs text-slate-400 mt-1">Zero payment recorded yet</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-medium print:bg-slate-100 print:text-black">
                <tr>
                  <th className="py-2.5 px-3">Receipt #</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Adm #</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:divide-slate-200 print:text-black">
                {filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-mono text-blue-300 font-semibold">{p.receiptNumber}</td>
                    <td className="py-2 px-3 font-medium text-white print:text-black">{p.studentName}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{p.admissionNumber}</td>
                    <td className="py-2 px-3 capitalize">{p.paymentMethod}</td>
                    <td className="py-2 px-3">{p.paymentDate}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400 print:text-black">
                      ${p.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: OUTSTANDING DEBTORS */}
      {activeReport === 'debtors' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <span>
              Total Outstanding Tuition Debt: <strong className="text-white text-sm">${totalOutstandingFees.toFixed(2)} USD</strong>
            </span>
            <span>
              {studentBalanceList.filter((b) => b.balance > 0).length} students with outstanding fees
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-medium print:bg-slate-100 print:text-black">
                <tr>
                  <th className="py-2.5 px-3">Adm #</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Guardian Name & Phone</th>
                  <th className="py-2.5 px-3 text-right">Billed</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:divide-slate-200 print:text-black">
                {studentBalanceList
                  .filter((b) => b.balance > 0)
                  .sort((a, b) => b.balance - a.balance)
                  .map(({ student, balance, totalCharged, totalPaid }) => (
                    <tr key={student.id}>
                      <td className="py-2.5 px-3 font-mono text-blue-300 font-semibold">{student.admissionNumber}</td>
                      <td className="py-2.5 px-3 font-bold text-white print:text-black">{student.fullName}</td>
                      <td className="py-2.5 px-3">{student.className}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-white font-medium block print:text-black">{student.guardianName}</span>
                        <span className="text-[11px] text-slate-400">{student.guardianPhone}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">${totalCharged.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 print:text-black">${totalPaid.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-400 print:text-black">
                        ${balance.toFixed(2)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: ENROLMENT */}
      {activeReport === 'enrolment' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {getEnrolmentByClass().map(({ className, count }) => (
              <div key={className} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 print:border-slate-300">
                <span className="text-xs text-slate-400 block">{className}</span>
                <span className="text-xl font-black text-white print:text-black mt-1 block">{count}</span>
                <span className="text-[10px] text-slate-500">Enrolled Students</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-medium print:bg-slate-100 print:text-black">
                <tr>
                  <th className="py-2.5 px-3">Adm #</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Gender</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Enrolment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 print:divide-slate-200 print:text-black">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 px-3 font-mono text-blue-300">{s.admissionNumber}</td>
                    <td className="py-2 px-3 font-bold text-white print:text-black">{s.fullName}</td>
                    <td className="py-2 px-3">{s.className}</td>
                    <td className="py-2 px-3">{s.gender || '-'}</td>
                    <td className="py-2 px-3 uppercase text-[10px] font-bold">{s.status}</td>
                    <td className="py-2 px-3">{s.enrolmentDate || s.createdAt.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: CASHFLOW */}
      {activeReport === 'cashflow' && isOwner && (
        <div className="space-y-4">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 print:border-slate-300">
            <h3 className="font-bold text-base text-white print:text-black">Executive Cashflow Statement</h3>
            <p className="text-xs text-slate-400">
              Recorded cashflow represents verified fee collections minus authorized recorded operating expenditures.
            </p>

            <div className="divide-y divide-slate-800 print:divide-slate-300 text-sm">
              <div className="py-3 flex justify-between">
                <span className="text-slate-300 print:text-slate-700">Gross Student Fee Collections</span>
                <span className="font-bold text-emerald-400 print:text-black">
                  +${totalPaymentsCollected.toFixed(2)}
                </span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-slate-300 print:text-slate-700">Total Operating Expenses</span>
                <span className="font-bold text-rose-400 print:text-black">
                  -${totalExpenses.toFixed(2)}
                </span>
              </div>
              <div className="py-3 flex justify-between text-base font-black">
                <span className="text-white print:text-black">Net Recorded Financial Position</span>
                <span className={netFinancialPosition >= 0 ? 'text-teal-300 print:text-black' : 'text-amber-400'}>
                  ${netFinancialPosition.toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
