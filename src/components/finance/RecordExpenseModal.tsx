import React, { useState } from 'react';
import { X, TrendingDown, AlertCircle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { ExpenseCategory, PaymentMethod } from '../../types';

interface RecordExpenseModalProps {
  onClose: () => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Salaries & Wages',
  'Teaching Materials',
  'Utilities',
  'Repairs & Maintenance',
  'Transport',
  'Office Supplies',
  'School Equipment',
  'Other Approved'
];

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({ onClose }) => {
  const { recordExpense } = useSchool();

  const [category, setCategory] = useState<ExpenseCategory>('Utilities');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive expense amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a supporting description or purpose for this expense.');
      return;
    }

    setSubmitting(true);
    try {
      await recordExpense({
        category,
        amount: numAmount,
        description: description.trim(),
        paymentMethod,
        reference: reference.trim(),
        date
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record expense.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-600/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Record School Expense</h2>
              <p className="text-xs text-slate-400">
                Log authorized school expenditure with payment voucher details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Expense Category <span className="text-rose-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amount (USD $) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date of Expense <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description & Purpose <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Electricity bill (ZETDC token), A4 printing paper reams, generator fuel..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Paid Via <span className="text-rose-400">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              >
                <option value="cash">Petty Cash Desk</option>
                <option value="ecocash">EcoCash Merchant / Biller</option>
                <option value="bank_transfer">School Bank Account</option>
                <option value="swipe">Swipe / Debit Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Voucher / Receipt Ref
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. PV-104 or Invoice #558"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Submit and Cancel */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
