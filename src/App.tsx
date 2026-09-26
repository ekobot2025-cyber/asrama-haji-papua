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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
