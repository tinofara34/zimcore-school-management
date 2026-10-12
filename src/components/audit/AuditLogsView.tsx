import React, { useState } from 'react';
import { History, Search, ShieldCheck, Clock, User, ArrowRight } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useSchool();
  const { currentSchool } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedByEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400" />
            Immutable Audit Trail Logs
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Cryptographically sealed activity records for {currentSchool?.name}
          </p>
        </div>

        <div className="text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Write-once, Tamper-proof Audit Ledger</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Logs Timeline / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            No audit logs recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/40 transition flex items-start space-x-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono uppercase font-bold text-blue-300 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[11px]">
                        {log.action.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-white">{log.entityType.toUpperCase()}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-slate-200 mt-1.5 text-xs font-medium">{log.details}</p>

                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>Actor: <strong className="text-slate-300">{log.performedByEmail}</strong></span>
                    <span className="text-slate-600 font-mono">({log.performedBy})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
