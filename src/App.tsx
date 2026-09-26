import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ExecutiveDashboardPage } from './pages/dashboard/ExecutiveDashboardPage';
import { ReservationsPage } from './pages/operations/ReservationsPage';
import { ReservationCalendarPage } from './pages/operations/ReservationCalendarPage';
import { CheckinPage } from './pages/operations/CheckinPage';
import { CheckoutPage } from './pages/operations/CheckoutPage';
import { RoomAssignmentPage } from './pages/operations/RoomAssignmentPage';
import { GuestsPage } from './pages/operations/GuestsPage';
import { GroupsPage } from './pages/operations/GroupsPage';
import { RoomStatusBoardPage } from './pages/accommodation/RoomStatusBoardPage';
import { BuildingsPage } from './pages/accommodation/BuildingsPage';
import { RoomsPage } from './pages/accommodation/RoomsPage';
import { BedsPage } from './pages/accommodation/BedsPage';
import { FacilitiesPage } from './pages/accommodation/FacilitiesPage';
import { HousekeepingPage } from './pages/room-ops/HousekeepingPage';
import { MaintenancePage } from './pages/room-ops/MaintenancePage';
import { RatesPage } from './pages/finance/RatesPage';
import { InvoicesPage } from './pages/finance/InvoicesPage';
import { PaymentsPage } from './pages/finance/PaymentsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { InstitutionsPage } from './pages/master/InstitutionsPage';
import { RoomTypesPage } from './pages/master/RoomTypesPage';
import { UsersPage } from './pages/system/UsersPage';
import { AuditLogPage } from './pages/system/AuditLogPage';
import { SettingsPage } from './pages/system/SettingsPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [targetId, setTargetId] = useState<string | undefined>(undefined);

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
    setTargetId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'executive-dashboard':
        return <ExecutiveDashboardPage />;
      case 'reservations':
        return <ReservationsPage onNavigate={handleNavigate} initialTargetId={targetId} />;
      case 'reservation-calendar':
        return <ReservationCalendarPage onNavigate={handleNavigate} />;
      case 'checkin':
        return <CheckinPage onNavigate={handleNavigate} initialReservationId={targetId} />;
      case 'checkout':
        return <CheckoutPage onNavigate={handleNavigate} initialReservationId={targetId} />;
      case 'room-assignment':
        return <RoomAssignmentPage onNavigate={handleNavigate} initialReservationId={targetId} />;
      case 'guests':
        return <GuestsPage />;
      case 'groups':
        return <GroupsPage onNavigate={handleNavigate} />;
      case 'room-status-board':
        return <RoomStatusBoardPage onNavigate={handleNavigate} />;
      case 'buildings':
        return <BuildingsPage />;
      case 'rooms':
        return <RoomsPage />;
      case 'beds':
        return <BedsPage />;
      case 'facilities':
        return <FacilitiesPage />;
      case 'housekeeping':
        return <HousekeepingPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'rates':
        return <RatesPage />;
      case 'invoices':
        return <InvoicesPage onNavigate={handleNavigate} initialInvoiceId={targetId} />;
      case 'payments':
        return <PaymentsPage onNavigate={handleNavigate} initialInvoiceId={targetId} />;
      case 'reports':
        return <ReportsPage />;
      case 'master-institutions':
        return <InstitutionsPage />;
      case 'master-room-types':
        return <RoomTypesPage />;
      case 'system-users':
        return <UsersPage />;
      case 'audit-logs':
        return <AuditLogPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </AppLayout>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SIPAH PAPUA App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4 text-2xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold mb-2">Terjadi Gangguan Tampilan</h2>
            <p className="text-xs text-slate-400 mb-4">
              {this.state.error?.message || 'Gagal memuat antarmuka sistem.'}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-xs font-semibold text-white transition-colors"
            >
              Reset Data & Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
