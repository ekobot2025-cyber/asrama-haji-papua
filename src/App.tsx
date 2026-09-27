import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { db } from './db/database';

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
import { FrontDeskPosPage } from './pages/operations/FrontDeskPosPage';
import { LandingPage } from './pages/landing/LandingPage';
import { ScrollToTopButton } from './components/common/ScrollToTopButton';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Button } from './components/common/Button';
import { UserRole } from './types';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');
  const [currentPage, setCurrentPage] = useState<string>(() => {
    try {
      const savedUser = db.getUsers().find(u => u.id === localStorage.getItem('sipah_auth_user_id'));
      if (savedUser?.role === 'RESEPSIONIS') return 'frontdesk-pos';
      if (savedUser?.role === 'HOUSEKEEPING') return 'housekeeping';
      if (savedUser?.role === 'KEUANGAN') return 'invoices';
      if (savedUser?.role === 'PIMPINAN') return 'executive-dashboard';
    } catch {}
    return 'dashboard';
  });
  const [targetId, setTargetId] = useState<string | undefined>(undefined);

  const canAccessRole = (role: UserRole, page: string): boolean => {
    if (role === 'SUPER_ADMIN') return true;

    switch (page) {
      case 'dashboard':
        return ['ADMIN_PENGINAPAN', 'KEUANGAN', 'PIMPINAN'].includes(role);
      case 'executive-dashboard':
        return role === 'PIMPINAN';
      case 'frontdesk-pos':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS'].includes(role);
      case 'reservations':
      case 'reservation-calendar':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'PIMPINAN', 'KEUANGAN'].includes(role);
      case 'checkin':
      case 'checkout':
      case 'room-assignment':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS'].includes(role);
      case 'guests':
      case 'groups':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'KEUANGAN'].includes(role);
      case 'room-status-board':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'HOUSEKEEPING', 'PIMPINAN'].includes(role);
      case 'buildings':
      case 'rooms':
      case 'beds':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'HOUSEKEEPING'].includes(role);
      case 'facilities':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'PIMPINAN'].includes(role);
      case 'housekeeping':
      case 'maintenance':
        return ['ADMIN_PENGINAPAN', 'HOUSEKEEPING'].includes(role);
      case 'rates':
      case 'invoices':
      case 'payments':
        return ['ADMIN_PENGINAPAN', 'KEUANGAN', 'RESEPSIONIS', 'PIMPINAN'].includes(role);
      case 'reports':
        return ['ADMIN_PENGINAPAN', 'KEUANGAN', 'PIMPINAN'].includes(role);
      case 'master-institutions':
      case 'master-room-types':
        return role === 'ADMIN_PENGINAPAN';
      case 'system-users':
      case 'audit-logs':
      case 'settings':
        return false;
      default:
        return true;
    }
  };

  const getDefaultPageForRole = (role: UserRole): string => {
    switch (role) {
      case 'HOUSEKEEPING': return 'housekeeping';
      case 'RESEPSIONIS': return 'frontdesk-pos';
      case 'KEUANGAN': return 'invoices';
      case 'PIMPINAN': return 'executive-dashboard';
      case 'ADMIN_PENGINAPAN': return 'dashboard';
      case 'SUPER_ADMIN': return 'dashboard';
      default: return 'dashboard';
    }
  };

  const handleNavigate = (page: string, id?: string) => {
    setCurrentPage(page);
    setTargetId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    if (authView === 'login') {
      return <LoginPage onBackToLanding={() => setAuthView('landing')} />;
    }
    return <LandingPage onGoToLogin={() => setAuthView('login')} />;
  }

  // If authenticated user navigates to 'landing', render LandingPage with quick access back to dashboard
  if (currentPage === 'landing' && currentUser) {
    return (
      <LandingPage
        onGoToLogin={() => handleNavigate(getDefaultPageForRole(currentUser.role))}
        currentUser={currentUser}
      />
    );
  }

  const renderPage = () => {
    // RBAC Security Guard: Check if current role has permission to access the requested page
    if (currentUser && !canAccessRole(currentUser.role, currentPage)) {
      const allowedTarget = getDefaultPageForRole(currentUser.role);
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 tracking-wider">
              Akses Dibatasi (RBAC Guard)
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-2">
              Hak Akses Tidak Memadai
            </h2>
            <p className="text-xs text-slate-600 max-w-md mt-1 leading-relaxed">
              Akun Anda saat ini (<strong>{currentUser.name}</strong> &bull; Peran: <strong className="text-rose-700">{currentUser.role}</strong>) tidak memiliki hak akses untuk membuka modul <strong>{currentPage}</strong> sesuai Standar Operasional Prosedur (SOP) UPT Asrama Haji Papua.
            </p>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleNavigate(allowedTarget)}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Kembali ke Menu Utama ({allowedTarget})
            </Button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'frontdesk-pos':
        return <FrontDeskPosPage onNavigate={handleNavigate} />;
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
              className="px-4 py-2 bg-[#c9a961] hover:bg-[#c9a961] rounded-xl text-xs font-semibold text-white transition-colors"
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
            <ScrollToTopButton />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
