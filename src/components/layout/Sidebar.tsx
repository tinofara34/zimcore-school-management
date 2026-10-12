import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Receipt,
  TrendingDown,
  BookOpen,
  FileBarChart,
  History,
  Settings,
  PlusCircle,
  Clock,
  Layers,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { userProfile, currentSchool } = useAuth();
  const isOwner = userProfile?.role === 'owner';

  const ownerNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students & Enrolments', icon: Users },
    { id: 'payments', label: 'Fee Collections & Receipts', icon: CreditCard },
    { id: 'expenses', label: 'School Expenses', icon: TrendingDown },
    { id: 'classes', label: 'Classes & Fee Schedules', icon: Layers },
    { id: 'reports', label: 'Financial & Term Reports', icon: FileBarChart },
    { id: 'audit', label: 'Audit Trail Logs', icon: History },
    { id: 'settings', label: 'School Settings & Plan', icon: Settings },
  ];

  const bursarNavItems = [
    { id: 'bursar_dashboard', label: 'Bursar Operations Desk', icon: LayoutDashboard },
    { id: 'record_payment', label: 'Record Fee Payment', icon: PlusCircle, highlight: true },
    { id: 'students', label: 'Student Directory & Add', icon: Users },
    { id: 'payments', label: 'Payment Receipts', icon: Receipt },
    { id: 'record_expense', label: 'Record School Expense', icon: TrendingDown },
    { id: 'expenses', label: 'Recorded Expenses', icon: BookOpen },
    { id: 'daily_report', label: 'Daily Collections Report', icon: Clock },
    { id: 'classes', label: 'Class Enrolment Rosters', icon: Layers },
  ];

  const navItems = isOwner ? ownerNavItems : bursarNavItems;

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Active School & Role Box */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              {isOwner ? (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              ) : (
                <Briefcase className="w-4 h-4 text-teal-400" />
              )}
              <span className="uppercase tracking-wider">
                {isOwner ? 'School Owner Access' : 'Bursar Administration'}
              </span>
            </div>
            <div className="mt-1 text-sm font-bold text-white truncate">
              {currentSchool?.name || 'Zimcore School'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {userProfile?.displayName || userProfile?.email}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {isOwner ? 'Management Modules' : 'Daily Operations'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : item.highlight
                      ? 'bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status / Quick Currency Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Currency:</span>
            <span className="font-semibold text-slate-200">USD ($) Standard</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>Market:</span>
            <span className="text-emerald-400 font-medium">Zimbabwe (ZIMSEC/Camb.)</span>
          </div>
        </div>
      </aside>
    </>
  );
};
