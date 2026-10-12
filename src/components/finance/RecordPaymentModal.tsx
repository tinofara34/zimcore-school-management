import React, { useState, useMemo } from 'react';
import { X, CreditCard, Search, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Student, Payment, PaymentMethod } from '../../types';

interface RecordPaymentModalProps {
  preselectedStudent?: Student | null;
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  preselectedStudent,
  onClose,
  onSuccess
}) => {
  const { students, recordPayment, getStudentBalance } = useSchool();
  const { currentSchool } = useAuth();

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(preselectedStudent || null);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [reference, setReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter students for search dropdown
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return [];
    const term = studentSearch.toLowerCase();
    return students
      .filter(
        (s) =>
          s.status === 'active' &&
          (s.fullName.toLowerCase().includes(term) || s.admissionNumber.toLowerCase().includes(term))
      )
      .slice(0, 5);
  }, [students, studentSearch]);

  const activeStudentBalance = selectedStudent ? getStudentBalance(selectedStudent.id) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudent) {
      setError('Please select a student for this payment.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive payment amount.');
      return;
    }

    if (paymentMethod === 'ecocash' && !reference.trim()) {
      setError('Please provide the EcoCash transaction approval code or mobile number reference.');
      return;
    }

    setSubmitting(true);
    try {
      const createdPayment = await recordPayment({
        studentId: selectedStudent.id,
        amount: numAmount,
        paymentMethod,
        reference: reference.trim(),
        paymentDate
      });
      onSuccess(createdPayment);
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment transaction.');
      setSubmitting(false);
    }
  };

  const handleFillAmount = (val: number) => {
    setAmount(val.toString());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Record Student Fee Payment</h2>
              <p className="text-xs text-slate-400">
                Official Bursar Receipt Issue • {currentSchool?.currentTerm} ({currentSchool?.currentAcademicYear})
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

          {/* Student Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Student <span className="text-rose-400">*</span>
            </label>

            {selectedStudent ? (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">{selectedStudent.fullName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Adm: {selectedStudent.admissionNumber} • {selectedStudent.className}
                  </div>
                </div>
                {!preselectedStudent && (
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type student name or admission number to search..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />

                {filteredStudents.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-20 divide-y divide-slate-800">
                    {filteredStudents.map((s) => {
                      const b = getStudentBalance(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedStudent(s);
                            setStudentSearch('');
                          }}
                          className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition"
                        >
                          <div>
                            <span className="font-bold text-white block">{s.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Adm: {s.admissionNumber} • {s.className}
                            </span>
                          </div>
                          <span className="font-bold text-rose-400">
                            Due: ${b.balance.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Balance info box if student selected */}
          {activeStudentBalance && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Current Outstanding Balance</span>
                <span
                  className={`text-base font-extrabold ${
                    activeStudentBalance.balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  ${activeStudentBalance.balance.toFixed(2)} USD
                </span>
              </div>
              {activeStudentBalance.balance > 0 && (
                <button
                  type="button"
                  onClick={() => handleFillAmount(activeStudentBalance.balance)}
                  className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[11px] font-semibold border border-blue-500/30"
                >
                  Pay Full Balance
                </button>
              )}
            </div>
          )}

          {/* Amount Input & Shortcut Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Payment Amount (USD $) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick shortcuts */}
            <div className="flex items-center gap-2 mt-2">
              {[50, 100, 200, 250].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleFillAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Method <span className="text-rose-400">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="cash">Cash (USD Cash Desk)</option>
                <option value="ecocash">EcoCash Mobile Money</option>
                <option value="bank_transfer">Bank Transfer / Nostro</option>
                <option value="swipe">Swipe (POS Card)</option>
                <option value="other">Other Approved Method</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Reference field (Required for EcoCash or Bank) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Payment Reference / Txn Code {paymentMethod === 'ecocash' && <span className="text-rose-400">*</span>}
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={
                paymentMethod === 'ecocash'
                  ? 'e.g. MP260408.1402.L98321 or phone number'
                  : 'e.g. Bank POP reference or receipt note'
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'Generating Receipt...' : 'Record & Issue Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
