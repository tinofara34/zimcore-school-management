import React, { useState } from 'react';
import {
  School as SchoolIcon,
  ShieldCheck,
  Briefcase,
  Bell,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';

interface NavbarProps {
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeTab, setActiveTab }) => {
  const { userProfile, currentSchool, connectionStatus, switchRoleForTesting, signOut } = useAuth();
  const { notifications, markNotificationAsRead } = useSchool();
  const [showNotifications, setShowNotifications] = useState(false);
  const [switching, setSwitching] = useState(false);

  const unreadNotifications = notifications.filter((n) => !n.read);

  const handleRoleToggle = async () => {
    if (!userProfile) return;
    setSwitching(true);
    const targetRole = userProfile.role === 'owner' ? 'bursar' : 'owner';
    await switchRoleForTesting(targetRole);
    setSwitching(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-md font-bold">
                <SchoolIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-white">Zimcore</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    SMS
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs">
                  {currentSchool?.name || 'School Management'}
                </div>
              </div>
            </div>
          </div>

          {/* Center: School Term & Live Connection Indicator */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            {currentSchool && (
              <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                {currentSchool.currentTerm} • {currentSchool.currentAcademicYear}
              </span>
            )}

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Live Database Sync</span>
            </div>
          </div>

          {/* Right: Role Badge, Quick Tester Switch, Notifications & User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Role Tester Switch */}
            {userProfile && (
              <button
                onClick={handleRoleToggle}
                disabled={switching}
                title="Click to quickly switch between Owner and Bursar perspective to test live synchronization"
                className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                  userProfile.role === 'owner'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                    : 'bg-teal-500/10 text-teal-300 border-teal-500/40 hover:bg-teal-500/20'
                }`}
              >
                {userProfile.role === 'owner' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold hidden sm:inline">Role: School Owner</span>
                    <span className="font-semibold sm:hidden">Owner</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                    <span className="font-semibold hidden sm:inline">Role: Bursar</span>
                    <span className="font-semibold sm:hidden">Bursar</span>
                  </>
                )}
                <RefreshCw className={`w-3 h-3 ml-0.5 text-slate-400 ${switching ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-semibold text-sm text-white">Live School Alerts</span>
                    <span className="text-xs text-slate-400">{unreadNotifications.length} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No alerts yet. Transactions and enrolments will appear live here.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3 text-xs hover:bg-slate-800/80 cursor-pointer transition flex items-start space-x-2.5 ${
                            !notif.read ? 'bg-slate-800/40' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {notif.type === 'payment' && <CreditCard className="w-4 h-4 text-emerald-400" />}
                            {notif.type === 'enrolment' && <UserCheck className="w-4 h-4 text-blue-400" />}
                            {notif.type === 'alert' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                            {notif.type === 'expense' && <CreditCard className="w-4 h-4 text-rose-400" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white flex justify-between">
                              <span>{notif.title}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="text-slate-300 mt-0.5 line-clamp-2">{notif.message}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sign Out */}
            <button
              onClick={signOut}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
