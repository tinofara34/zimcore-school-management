import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Search,
  Filter,
  FileSpreadsheet,
  PlusCircle,
  AlertTriangle,
  RotateCcw,
  Tag
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Expense, ExpenseCategory } from '../../types';
import { RecordExpenseModal } from './RecordExpenseModal';

export const ExpensesList: React.FC = () => {
  const { expenses, reverseExpense, totalExpenses, getExpensesByCategory } = useSchool();
  const { userProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'confirmed' | 'reversed'>('all');

  const [showRecordModal, setShowRecordModal] = useState(false);
  const [reversingExpense, setReversingExpense] = useState<Expense | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);
  const [reversalError, setReversalError] = useState<string | null>(null);

  const isOwner = userProfile?.role === 'owner';
  const categorySummary = getExpensesByCategory();

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.reference && e.reference.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || e.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [expenses, searchTerm, selectedCategory, selectedStatus]);

  const handleConfirmReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversingExpense) return;
    if (!reversalReason.trim()) {
      setReversalError('You must enter an authorized reason for reversing this expense record.');
      return;
    }

    setReversing(true);
    setReversalError(null);
    try {
      await reverseExpense(reversingExpense.id, reversalReason.trim());
      setReversingExpense(null);
      setReversalReason('');
    } catch (err: any) {
      setReversalError(err?.message || 'Failed to reverse expense.');
    } finally {
      setReversing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Category', 'Description', 'Amount', 'Date', 'Payment Method', 'Reference', 'Recorded By', 'Status', 'Reversal Reason'];
    const rows = filteredExpenses.map((e) => [
      `"${e.category}"`,
      `"${e.description}"`,
      e.amount.toFixed(2),
      `"${e.date}"`,
      `"${e.paymentMethod}"`,
      `"${e.reference || ''}"`,
      `"${e.recordedByEmail}"`,
      `"${e.status}"`,
      `"${e.reversalReason || ''}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zimcore_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-400" />
            School Expenditure & Outflows
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Total active recorded expenses: <span className="text-rose-400 font-bold">${totalExpenses.toFixed(2)} USD</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export CSV
          </button>
          <button
            onClick={() => setShowRecordModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Record Expense
          </button>
        </div>
      </div>

      {/* Category Breakdown Chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categorySummary).map(([cat, total]) => (
          <div
            key={cat}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2 shadow-xs"
          >
            <Tag className="w-3 h-3 text-slate-400" />
            <span className="text-slate-300 font-medium">{cat}:</span>
            <span className="font-bold text-white">${total.toFixed(0)}</span>
          </div>
        ))}
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search description, category, or voucher #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Categories</option>
            {Object.keys(categorySummary).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="reversed">Reversed</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <TrendingDown className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            No expenses recorded yet matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-medium">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description & Ref</th>
                  <th className="py-3 px-4">Paid Via</th>
                  <th className="py-3 px-4">Recorded By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount (USD)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredExpenses.map((e) => (
                  <tr
                    key={e.id}
                    className={`hover:bg-slate-800/40 transition ${
                      e.status === 'reversed' ? 'opacity-60 bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{e.date}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{e.category}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{e.description}</div>
                      {e.reference && (
                        <div className="text-[11px] font-mono text-slate-400">Ref: {e.reference}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-300">{e.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-slate-400 truncate max-w-[140px]">
                      {e.recordedByEmail}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          e.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-sm text-rose-400">
                      ${e.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {e.status === 'confirmed' && isOwner && (
                        <button
                          onClick={() => setReversingExpense(e)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Reverse Expense with Audited Reason"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reversal Confirmation Modal */}
      {reversingExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Reverse School Expense</h3>
            </div>

            <p className="text-xs text-slate-300">
              You are reversing the expense entry: <strong className="text-white">{reversingExpense.category}</strong> (${reversingExpense.amount.toFixed(2)}) - "{reversingExpense.description}".
            </p>

            {reversalError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {reversalError}
              </div>
            )}

            <form onSubmit={handleConfirmReversal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Reversal <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Duplicate voucher, reimbursed expenditure, or clerical error..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReversingExpense(null);
                    setReversalReason('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversing}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
                >
                  {reversing ? 'Reversing...' : 'Confirm Reversal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showRecordModal && (
        <RecordExpenseModal onClose={() => setShowRecordModal(false)} />
      )}
    </div>
  );
};
