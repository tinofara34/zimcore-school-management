import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthScreen } from './components/auth/AuthScreen';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { BursarDashboard } from './components/bursar/BursarDashboard';
import { StudentList } from './components/students/StudentList';
import { PaymentsList } from './components/finance/PaymentsList';
import { ExpensesList } from './components/finance/ExpensesList';
import { ClassesAndFees } from './components/academic/ClassesAndFees';
import { ReportsView } from './components/reports/ReportsView';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SchoolSettings } from './components/settings/SchoolSettings';
import { RecordPaymentModal } from './components/finance/RecordPaymentModal';
import { RecordExpenseModal } from './components/finance/RecordExpenseModal';
import { ReceiptModal } from './components/finance/ReceiptModal';
import { Payment } from './types';
import { School as SchoolIcon } from 'lucide-react';

const MainApp: React.FC = () => {
  const { userProfile, currentSchool, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick modals for standalone menu triggers
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [showQuickExpense, setShowQuickExpense] = useState(false);
  const [issuedReceipt, setIssuedReceipt] = useState<Payment | null>(null);

  // Synchronize default tab with role
  useEffect(() => {
    if (userProfile) {
      if (userProfile.role === 'owner') {
        if (activeTab === 'bursar_dashboard' || activeTab === 'record_payment') {
          setActiveTab('dashboard');
        }
      } else {
        if (activeTab === 'dashboard' || activeTab === 'audit' || activeTab === 'settings') {
          setActiveTab('bursar_dashboard');
        }
      }
    }
  }, [userProfile?.role]);

  // Handle special trigger tabs like record_payment
  const handleTabChange = (tab: string) => {
    if (tab === 'record_payment') {
      setShowQuickPayment(true);
      return;
    }
    if (tab === 'record_expense') {
      setShowQuickExpense(true);
      return;
    }
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold animate-bounce shadow-xl">
          <SchoolIcon className="w-6 h-6" />
        </div>
        <p className="mt-4 text-sm font-semibold tracking-wide text-slate-300">
          Loading Zimcore School Management System...
        </p>
      </div>
    );
  }

  // If unauthenticated or no school assigned yet, show Auth & Onboarding screen
  if (!userProfile || !currentSchool) {
    return <AuthScreen />;
  }

  const isOwner = userProfile.role === 'owner';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Role-Aware Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && <OwnerDashboard onNavigate={handleTabChange} />}
          {activeTab === 'bursar_dashboard' && <BursarDashboard onNavigate={handleTabChange} />}
          {activeTab === 'students' && <StudentList />}
          {activeTab === 'payments' && <PaymentsList />}
          {activeTab === 'expenses' && <ExpensesList />}
          {activeTab === 'classes' && <ClassesAndFees />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'daily_report' && <ReportsView defaultReport="daily" />}
          {activeTab === 'audit' && isOwner && <AuditLogsView />}
          {activeTab === 'settings' && <SchoolSettings />}
        </main>
      </div>

      {/* Standalone Quick Action Modals */}
      {showQuickPayment && (
        <RecordPaymentModal
          onClose={() => setShowQuickPayment(false)}
          onSuccess={(p) => {
            setShowQuickPayment(false);
            setIssuedReceipt(p);
          }}
        />
      )}

      {showQuickExpense && (
        <RecordExpenseModal onClose={() => setShowQuickExpense(false)} />
      )}

      {issuedReceipt && (
        <ReceiptModal
          payment={issuedReceipt}
          onClose={() => setIssuedReceipt(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <MainApp />
      </SchoolProvider>
    </AuthProvider>
  );
}
