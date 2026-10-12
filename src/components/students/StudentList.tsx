import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  CreditCard,
  Phone,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { StudentFormModal } from './StudentFormModal';
import { StudentProfileModal } from './StudentProfileModal';
import { RecordPaymentModal } from '../finance/RecordPaymentModal';
import { Student, Payment } from '../../types';

export const StudentList: React.FC = () => {
  const { students, classes, getStudentBalance } = useSchool();
  const { userProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'transferred' | 'withdrawn'>('active');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchTerm, selectedClass, selectedStatus]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Admission Number', 'Full Name', 'Class', 'Gender', 'Status', 'Guardian', 'Phone', 'Total Charged', 'Total Paid', 'Balance'];
    const rows = filteredStudents.map((s) => {
      const bal = getStudentBalance(s.id);
      return [
        `"${s.admissionNumber}"`,
        `"${s.fullName}"`,
        `"${s.className}"`,
        `"${s.gender || ''}"`,
        `"${s.status}"`,
        `"${s.guardianName}"`,
        `"${s.guardianPhone}"`,
        bal.totalCharged.toFixed(2),
        bal.totalPaid.toFixed(2),
        bal.balance.toFixed(2)
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zimcore_students_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <Users className="w-6 h-6 text-blue-400" />
            Student Enrolment Directory
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Showing {filteredStudents.length} of {students.length} registered students
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
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Register Student
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or admission number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Enrolled</option>
            <option value="transferred">Transferred</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            No student records found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-medium">
                <tr>
                  <th className="py-3 px-4">Adm #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Guardian / Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Fee Balance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredStudents.map((student) => {
                  const bal = getStudentBalance(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-300">
                        {student.admissionNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{student.fullName}</div>
                        <div className="text-[11px] text-slate-400">
                          Admitted: {student.termOfAdmission} ({student.academicYear})
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-medium">
                          {student.className}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{student.guardianName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {student.guardianPhone}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            student.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : student.status === 'transferred'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className={`font-bold ${
                            bal.balance > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          ${bal.balance.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Charged: ${bal.totalCharged.toFixed(0)} | Paid: ${bal.totalPaid.toFixed(0)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedStudentForProfile(student)}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition"
                            title="View Student Profile & Financial Statement"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedStudentForPayment(student)}
                            className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition"
                            title="Record Payment"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <StudentFormModal onClose={() => setShowAddModal(false)} />
      )}

      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          onRecordPayment={() => {
            setSelectedStudentForPayment(selectedStudentForProfile);
            setSelectedStudentForProfile(null);
          }}
        />
      )}

      {selectedStudentForPayment && (
        <RecordPaymentModal
          preselectedStudent={selectedStudentForPayment}
          onClose={() => setSelectedStudentForPayment(null)}
          onSuccess={() => setSelectedStudentForPayment(null)}
        />
      )}
    </div>
  );
};
