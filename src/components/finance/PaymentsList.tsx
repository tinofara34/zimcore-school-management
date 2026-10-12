import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  CreditCard
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Payment } from '../../types';
import { ReceiptModal } from './ReceiptModal';
import { RecordPaymentModal } from './RecordPaymentModal';

export const PaymentsList: React.FC = () => {
  const { payments, reversePayment } = useSchool();
  const { userProfile, currentSchool } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'reversed'>('all');

  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [reversingPayment, setReversingPayment] = useState<Payment | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);
  const [reversalError, setReversalError] = useState<string | null>(null);

  const isOwner = userProfile?.role === 'owner';

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesMethod && matchesStatus;
    });
  }, [payments, searchTerm, methodFilter, statusFilter]);

  const totalCollectedFiltered = useMemo(() => {
    return filteredPayments
      .filter((p) => p.status === 'confirmed')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }, [filteredPayments]);

  const handleConfirmReversal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversingPayment) return;
    if (!reversalReason.trim()) {
      setReversalError('You must enter an authorized reason for this financial reversal.');
      return;
    }

    setReversing(true);
    setReversalError(null);
    try {
      await reversePayment(reversingPayment.id, reversalReason.trim());
      setReversingPayment(null);
      setReversalReason('');
    } catch (err: any) {
      setReversalError(err?.message || 'Failed to reverse payment record.');
    } finally {
      setReversing(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Receipt Number', 'Student Name', 'Admission #', 'Amount', 'Method', 'Reference', 'Date', 'Term', 'Recorded By', 'Status', 'Reversal Reason'];
    const rows = filteredPayments.map((p) => [
      `"${p.receiptNumber}"`,
      `"${p.studentName}"`,
      `"${p.admissionNumber}"`,
      p.amount.toFixed(2),
      `"${p.paymentMethod}"`,
      `"${p.reference || ''}"`,
      `"${p.paymentDate}"`,
      `"${p.term}"`,
      `"${p.recordedByName || p.recordedByEmail}"`,
      `"${p.status}"`,
      `"${p.reversalReason || ''}"`
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zimcore_payments_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <Receipt className="w-6 h-6 text-emerald-400" />
            Fee Collections & Receipts
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Total active collections shown: <span className="text-emerald-400 font-bold">${totalCollectedFiltered.toFixed(2)} USD</span>
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt #, student, or txn reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash Desk</option>
            <option value="ecocash">EcoCash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="swipe">Swipe / Card</option>
            <option value="other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed Valid</option>
            <option value="reversed">Reversed / Cancelled</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            No payment records found matching the specified filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-medium">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method & Ref</th>
                  <th className="py-3 px-4">Issued By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Amount (USD)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-800/40 transition ${
                      p.status === 'reversed' ? 'opacity-60 bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-300">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{p.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Adm: {p.admissionNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200">{p.paymentDate}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.term} {p.academicYear}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="capitalize font-medium text-white">{p.paymentMethod}</div>
                      {p.reference && (
                        <div className="text-[11px] font-mono text-slate-400 truncate max-w-[120px]">
                          Ref: {p.reference}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{p.recordedByName || 'Bursar'}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {p.recordedByEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div
                        className={`font-black text-sm ${
                          p.status === 'reversed' ? 'line-through text-slate-400' : 'text-emerald-400'
                        }`}
                      >
                        ${p.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="px-2.5 py-1 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>

                        {/* Authorized Reversal Action */}
                        {p.status === 'confirmed' && isOwner && (
                          <button
                            onClick={() => setReversingPayment(p)}
                            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            title="Reverse Transaction with Audited Reason"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reversal Confirmation Modal */}
      {reversingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-white">Reverse Payment Receipt</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to reverse receipt <strong className="text-white font-mono">{reversingPayment.receiptNumber}</strong> (${reversingPayment.amount.toFixed(2)}) for <strong className="text-white">{reversingPayment.studentName}</strong>.
            </p>
            <p className="text-xs text-slate-400">
              This financial record will not be erased; it will be marked as reversed and recalculate the student's balance and cashflow in real time.
            </p>

            {reversalError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {reversalError}
              </div>
            )}

            <form onSubmit={handleConfirmReversal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Documented Reason for Reversal <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Duplicate entry by bursar, bounced bank transfer, or corrected amount..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReversingPayment(null);
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

      {/* Record Payment Modal */}
      {showRecordModal && (
        <RecordPaymentModal
          onClose={() => setShowRecordModal(false)}
          onSuccess={(p) => {
            setShowRecordModal(false);
            setSelectedReceipt(p);
          }}
        />
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
