import React, { useState } from 'react';
import {
  School as SchoolIcon,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const {
    currentUser,
    registerSchoolAndOwner,
    joinAsBursar,
    signInWithGoogle,
    signOut,
    connectionStatus
  } = useAuth();

  const [activeMode, setActiveMode] = useState<'owner_register' | 'bursar_join'>('owner_register');

  // Owner Register Fields
  const [schoolName, setSchoolName] = useState('Heritage Academy Harare');
  const [phone, setPhone] = useState('+263 77 234 5678');
  const [address, setAddress] = useState('Borrowdale, Harare, Zimbabwe');
  const [academicYear, setAcademicYear] = useState('2026');
  const [term, setTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');

  // Bursar Join Fields
  const [bursarSchoolId, setBursarSchoolId] = useState('');
  const [bursarName, setBursarName] = useState('Memory Mutasa');

  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      setError('Please provide your school name.');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      await registerSchoolAndOwner(schoolName.trim(), phone.trim(), address.trim(), academicYear.trim(), term);
    } catch (err: any) {
      setError(err?.message || 'Failed to register school.');
    } finally {
      setProcessing(false);
    }
  };

  const handleBursarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bursarSchoolId.trim() || !bursarName.trim()) {
      setError('Please provide the School Access ID and your name.');
      return;
    }

    setProcessing(true);
    setError(null);
    try {
      await joinAsBursar(bursarSchoolId.trim(), bursarName.trim());
    } catch (err: any) {
      setError(err?.message || 'Failed to join school. Please check the School Access ID.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-950 mb-3 font-bold">
          <SchoolIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Zimcore
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          School Management System for Zimbabwe
        </p>

        {/* Live Status Pill */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{connectionStatus.message}</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {/* Current Auth Status */}
          {currentUser ? (
            <div className="mb-6 p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified User Account</div>
                  <div className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                    {currentUser.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                title="Switch Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-white block">Step 1: Account Authentication</span>
                  <span className="text-slate-400 text-[11px]">
                    Secure authentication connects your school database to your account.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition shrink-0 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Verify Identity</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveMode('owner_register');
                setError(null);
              }}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeMode === 'owner_register'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>School Owner</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('bursar_join');
                setError(null);
              }}
              className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                activeMode === 'bursar_join'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4 text-teal-300" />
              <span>Bursar Access</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE 1: OWNER REGISTRATION */}
          {activeMode === 'owner_register' ? (
            <form onSubmit={handleOwnerSubmit} className="space-y-4">
              <div className="text-left">
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
                  Step 2: Register Your School
                </span>
                <p className="text-[11px] text-slate-400 mb-3">
                  Full executive control, bursar management, live cashflow monitoring, and pupil records.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  School Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Heritage Academy Harare"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+263 77..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Currency
                  </label>
                  <input
                    type="text"
                    disabled
                    value="USD ($)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Physical Campus Location
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Harare, Zimbabwe"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Term
                  </label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <span>Registering School in Cloud Database...</span>
                ) : (
                  <>
                    <span>Launch School System as Owner</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* MODE 2: BURSAR JOINING */
            <form onSubmit={handleBursarSubmit} className="space-y-4">
              <div className="text-left">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-1">
                  Bursar Sign-In
                </span>
                <p className="text-[11px] text-slate-400 mb-3">
                  Enter the School Access ID provided by your School Owner to enter the administration dashboard.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  School Access ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bursarSchoolId}
                  onChange={(e) => setBursarSchoolId(e.target.value)}
                  placeholder="e.g. school_abc123"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bursar Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={bursarName}
                  onChange={(e) => setBursarName(e.target.value)}
                  placeholder="e.g. Memory Mutasa"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-950 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? 'Connecting...' : 'Access Bursar Operations'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
