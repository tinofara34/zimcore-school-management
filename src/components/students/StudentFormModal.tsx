import React, { useState } from 'react';
import { X, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Student } from '../../types';

interface StudentFormModalProps {
  onClose: () => void;
  studentToEdit?: Student;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({ onClose, studentToEdit }) => {
  const { classes, registerStudent, updateStudent, students } = useSchool();
  const { currentSchool } = useAuth();

  // Generate suggested admission number (e.g. ZC-2026-0042)
  const defaultYear = currentSchool?.currentAcademicYear || new Date().getFullYear().toString();
  const suggestedAdm = `ADM-${defaultYear}-${String(students.length + 1).padStart(4, '0')}`;

  const [admissionNumber, setAdmissionNumber] = useState(studentToEdit?.admissionNumber || suggestedAdm);
  const [fullName, setFullName] = useState(studentToEdit?.fullName || '');
  const [dob, setDob] = useState(studentToEdit?.dob || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(studentToEdit?.gender || 'Male');
  const [classId, setClassId] = useState(studentToEdit?.classId || (classes[0]?.id || ''));
  const [academicYear, setAcademicYear] = useState(studentToEdit?.academicYear || defaultYear);
  const [termOfAdmission, setTermOfAdmission] = useState<'Term 1' | 'Term 2' | 'Term 3'>(
    studentToEdit?.termOfAdmission || currentSchool?.currentTerm || 'Term 1'
  );
  const [enrolmentDate, setEnrolmentDate] = useState(
    studentToEdit?.enrolmentDate || new Date().toISOString().slice(0, 10)
  );
  const [guardianName, setGuardianName] = useState(studentToEdit?.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(studentToEdit?.guardianPhone || '');
  const [guardianAddress, setGuardianAddress] = useState(studentToEdit?.guardianAddress || '');
  const [customFeeDiscount, setCustomFeeDiscount] = useState<number>(studentToEdit?.customFeeDiscount || 0);
  const [notes, setNotes] = useState(studentToEdit?.notes || '');
  const [status, setStatus] = useState<'active' | 'transferred' | 'withdrawn'>(studentToEdit?.status || 'active');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !admissionNumber.trim() || !guardianName.trim() || !guardianPhone.trim()) {
      setError('Please fill in all mandatory fields (Name, Admission #, Guardian Name & Phone).');
      return;
    }

    const selectedClassObj = classes.find((c) => c.id === classId);
    const className = selectedClassObj?.name || 'General';

    setSubmitting(true);
    try {
      if (studentToEdit) {
        await updateStudent(studentToEdit.id, {
          fullName: fullName.trim(),
          dob,
          gender,
          classId,
          className,
          academicYear,
          termOfAdmission,
          guardianName: guardianName.trim(),
          guardianPhone: guardianPhone.trim(),
          guardianAddress: guardianAddress.trim(),
          customFeeDiscount: Number(customFeeDiscount) || 0,
          notes: notes.trim(),
          status
        });
      } else {
        await registerStudent({
          admissionNumber: admissionNumber.trim().toUpperCase(),
          fullName: fullName.trim(),
          dob,
          gender,
          classId,
          className,
          academicYear,
          termOfAdmission,
          enrolmentDate,
          guardianName: guardianName.trim(),
          guardianPhone: guardianPhone.trim(),
          guardianAddress: guardianAddress.trim(),
          customFeeDiscount: Number(customFeeDiscount) || 0,
          notes: notes.trim(),
          status
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save student record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {studentToEdit ? 'Edit Student Details' : 'Student Enrolment Registration'}
              </h2>
              <p className="text-xs text-slate-400">
                Official school admission register ({currentSchool?.name})
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Admission Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admission Number <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={!!studentToEdit}
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  placeholder="e.g. ADM-2026-0001"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Student Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Student Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Takudzwa Chitepo"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Class / Grade */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Assigned Class / Grade <span className="text-rose-400">*</span>
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Term of Admission */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Term of Admission
              </label>
              <select
                value={termOfAdmission}
                onChange={(e) => setTermOfAdmission(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guardian Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Mrs. R. Chitepo"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Guardian Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Guardian Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="e.g. +263 77 234 5678"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Guardian Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={guardianAddress}
                onChange={(e) => setGuardianAddress(e.target.value)}
                placeholder="e.g. 45 Josiah Chinamano Ave, Harare"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Custom Fee Discount / Scholarship */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Approved Fee Discount / Bursary ($)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={customFeeDiscount}
                onChange={(e) => setCustomFeeDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Enrolment Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active Enrolled</option>
                <option value="transferred">Transferred to another school</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Administrative Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special medical conditions, sibling discounts, or admission remarks..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Saving...' : studentToEdit ? 'Update Student' : 'Save & Enrol Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
