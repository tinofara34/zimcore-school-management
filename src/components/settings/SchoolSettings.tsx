import React, { useState } from 'react';
import {
  Settings,
  School as SchoolIcon,
  UserPlus,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

export const SchoolSettings: React.FC = () => {
  const { updateSchoolDetails } = useSchool();
  const { currentSchool, userProfile } = useAuth();

  const [name, setName] = useState(currentSchool?.name || '');
  const [phone, setPhone] = useState(currentSchool?.phone || '');
  const [address, setAddress] = useState(currentSchool?.address || '');
  const [term, setTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>(currentSchool?.currentTerm || 'Term 1');
  const [academicYear, setAcademicYear] = useState(currentSchool?.currentAcademicYear || '2026');

  const [bursarInviteEmail, setBursarInviteEmail] = useState('');
  const [copiedSchoolId, setCopiedSchoolId] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOwner = userProfile?.role === 'owner';

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateSchoolDetails({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        currentTerm: term,
        currentAcademicYear: academicYear.trim()
      });
      setSuccessMsg('School details and academic settings updated successfully.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const copySchoolId = () => {
    if (!currentSchool) return;
    navigator.clipboard.writeText(currentSchool.id);
    setCopiedSchoolId(true);
    setTimeout(() => setCopiedSchoolId(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          School Settings & Subscription Management
        </h1>
        <p className="text-slate-400 text-xs mt-0.5">
          Manage school identity, academic calendars, bursar linking, and subscription status
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. School Master Profile Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <SchoolIcon className="w-4 h-4 text-blue-400" />
          School Information & Address
        </h2>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official School Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!isOwner}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                disabled={!isOwner}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+263 77 123 4567"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Currency
              </label>
              <input
                type="text"
                disabled
                value="USD ($) - Standard in Zimbabwe"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-400 opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Physical Campus Address
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Stand 45, Borrowdale Road, Harare"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Academic Term & Year Settings */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Active Term <span className="text-rose-400">*</span>
              </label>
              <select
                disabled={!isOwner}
                value={term}
                onChange={(e) => setTerm(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
              >
                <option value="Term 1">Term 1 (Jan - Apr)</option>
                <option value="Term 2">Term 2 (May - Aug)</option>
                <option value="Term 3">Term 3 (Sep - Dec)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Academic Year <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!isOwner}
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white disabled:opacity-60 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {isOwner && (
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Save Settings'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 2. Bursar Account & Onboarding Linking */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-teal-400" />
          Bursar Access & Linking Code
        </h2>

        <p className="text-xs text-slate-300 leading-relaxed">
          The bursar does not register a new school. Provide your official <strong>School Access ID</strong> to your bursar to instantly link their account to this school database with restricted bursar permissions.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unique School Access ID</span>
            <span className="font-mono font-bold text-sm text-blue-300 select-all">
              {currentSchool?.id}
            </span>
          </div>

          <button
            onClick={copySchoolId}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            {copiedSchoolId ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy School ID</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Subscription Management Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            School Subscription Status
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {currentSchool?.subscriptionStatus || 'Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Plan Tier</span>
            <span className="font-bold text-white text-sm mt-0.5 block">Zimcore Private School</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Expiry Date</span>
            <span className="font-bold text-white text-sm mt-0.5 block">
              {currentSchool?.subscriptionExpiryDate
                ? new Date(currentSchool.subscriptionExpiryDate).toLocaleDateString()
                : 'Active 2026'}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase block">Grace Period</span>
            <span className="font-bold text-emerald-400 text-sm mt-0.5 block">14 Days Enabled</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
          <p className="font-semibold text-slate-300">Zimbabwe EcoCash & Nostro Subscription Information:</p>
          <p>
            School subscription billing is completely segregated from student fee collections. For automated EcoCash payment collection, merchant API credentials require Econet merchant approval.
          </p>
        </div>
      </div>
    </div>
  );
};
