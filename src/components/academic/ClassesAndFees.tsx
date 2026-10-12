import React, { useState } from 'react';
import {
  Layers,
  PlusCircle,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { ClassGrade, FeeStructure } from '../../types';

export const ClassesAndFees: React.FC = () => {
  const { classes, feeStructures, addClass, addFeeStructure, getEnrolmentByClass } = useSchool();
  const { currentSchool, userProfile } = useAuth();

  const isOwner = userProfile?.role === 'owner';

  // Add Class Form State
  const [showAddClass, setShowAddClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCapacity, setNewClassCapacity] = useState('35');
  const [newClassTeacher, setNewClassTeacher] = useState('');

  // Add Fee Structure Form State
  const [showAddFee, setShowAddFee] = useState(false);
  const [feeTitle, setFeeTitle] = useState('');
  const [feeClassId, setFeeClassId] = useState('all');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeTerm, setFeeTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>(
    currentSchool?.currentTerm || 'Term 1'
  );
  const [feeAcademicYear, setFeeAcademicYear] = useState(
    currentSchool?.currentAcademicYear || new Date().getFullYear().toString()
  );

  const [savingClass, setSavingClass] = useState(false);
  const [savingFee, setSavingFee] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enrolmentMap = Object.fromEntries(getEnrolmentByClass().map((e) => [e.className, e.count]));

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    setSavingClass(true);
    setError(null);
    try {
      await addClass(newClassName.trim(), parseInt(newClassCapacity) || 40, newClassTeacher.trim());
      setNewClassName('');
      setNewClassTeacher('');
      setShowAddClass(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to add class.');
    } finally {
      setSavingClass(false);
    }
  };

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(feeAmount);
    if (!feeTitle.trim() || isNaN(amountNum) || amountNum < 0) {
      setError('Please provide a valid fee title and non-negative amount.');
      return;
    }

    setSavingFee(true);
    setError(null);
    try {
      await addFeeStructure({
        title: feeTitle.trim(),
        classId: feeClassId,
        academicYear: feeAcademicYear,
        term: feeTerm,
        amount: amountNum,
        mandatory: true
      });
      setFeeTitle('');
      setFeeAmount('');
      setShowAddFee(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to add fee structure.');
    } finally {
      setSavingFee(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-400" />
            Classes & Academic Fee Schedules
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Configure school classes, enrolment quotas, and termly tuition billing
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddClass(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              Add Class
            </button>
            <button
              onClick={() => setShowAddFee(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              <DollarSign className="w-4 h-4" />
              Add Fee Schedule
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Two-Column Grid: Classes on Left, Fee Structures on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Classes Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Registered Classes ({classes.length})</h2>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddClass(true)}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                + New Class
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {classes.map((cls) => {
              const enrolled = enrolmentMap[cls.name] || 0;
              return (
                <div
                  key={cls.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{cls.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                      {enrolled} enrolled
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>Teacher: {cls.classTeacher || 'Unassigned'}</span>
                    <span>Cap: {cls.capacity || 40}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fee Structures Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">
                Fee Schedules ({feeStructures.length})
              </h2>
            </div>
            {isOwner && (
              <button
                onClick={() => setShowAddFee(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                + New Fee
              </button>
            )}
          </div>

          {feeStructures.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No fee schedule defined. Click "+ New Fee" to set class tuition and levies.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {feeStructures.map((fee) => {
                const targetClassName =
                  fee.classId === 'all'
                    ? 'All Classes & Grades'
                    : classes.find((c) => c.id === fee.classId)?.name || 'Specified Class';

                return (
                  <div key={fee.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{fee.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Applies to: <span className="text-blue-300 font-medium">{targetClassName}</span> • {fee.term} {fee.academicYear}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-400">
                        ${fee.amount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">Per Student</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddClass && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Add New Class / Grade</h3>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Form 5 Science, Grade 3 Red"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Capacity</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={newClassCapacity}
                  onChange={(e) => setNewClassCapacity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Class Teacher (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Moyo"
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingClass}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {savingClass ? 'Adding...' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fee Structure Modal */}
      {showAddFee && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Add Fee Schedule</h3>
            <form onSubmit={handleCreateFee} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fee Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 1 Tuition Fee, Sports Levy, Science Levy"
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Applies To</label>
                <select
                  value={feeClassId}
                  onChange={(e) => setFeeClassId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Enrolled Classes & Grades</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Only {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Term</label>
                  <select
                    value={feeTerm}
                    onChange={(e) => setFeeTerm(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={feeAcademicYear}
                    onChange={(e) => setFeeAcademicYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (USD $)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="250"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFee(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFee}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md disabled:opacity-50"
                >
                  {savingFee ? 'Saving...' : 'Save Fee Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
