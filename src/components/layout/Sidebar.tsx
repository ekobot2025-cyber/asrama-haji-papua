import React, { useState } from 'react';
import { 
  LayoutDashboard, CalendarCheck, CalendarDays, LogIn, LogOut, 
  Users, UserCheck, BedDouble, Building2, Layers, Hotel, 
  Sparkles, Wrench, Receipt, CreditCard, FileText, BarChart3, 
  Settings, ShieldAlert, History, ChevronDown, ChevronRight, 
  Landmark, UserCog, Briefcase, Award, Compass, ChevronLeft, BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenHelpGuide?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
  onOpenHelpGuide,
}) => {
  const { currentRole } = useAuth();

  // Collapsible sub-sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    operasional: true,
    penginapan: true,
    kamarOps: true,
    keuangan: true,
    laporan: false,
    master: false,
    sistem: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const navItemClass = (pageKey: string) => {
    const isActive = currentPage === pageKey;
    return `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
      isActive
        ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-bold shadow-md shadow-[#c9a961]/25 ring-1 ring-[#c9a961]/40'
        : 'text-stone-300 hover:text-white hover:bg-[#c9a961]/10 font-medium'
    }`;
  };

  const handleNav = (page: string) => {
    onNavigate(page);
    onCloseMobile();
  };

  // Role-Based Access Control (RBAC) Menu Permission Matrix
  const canAccess = (pageKey: string): boolean => {
    if (currentRole === 'SUPER_ADMIN') return true;

    switch (pageKey) {
      case 'dashboard':
        return ['ADMIN_PENGINAPAN', 'KEUANGAN', 'PIMPINAN'].includes(currentRole);
      case 'executive-dashboard':
        return currentRole === 'PIMPINAN';
      case 'frontdesk-pos':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS'].includes(currentRole);
      case 'reservations':
      case 'reservation-calendar':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'PIMPINAN', 'KEUANGAN'].includes(currentRole);
      case 'checkin':
      case 'checkout':
      case 'room-assignment':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS'].includes(currentRole);
      case 'guests':
      case 'groups':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'KEUANGAN'].includes(currentRole);
      case 'room-status-board':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'HOUSEKEEPING', 'PIMPINAN'].includes(currentRole);
      case 'buildings':
      case 'rooms':
      case 'beds':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'HOUSEKEEPING'].includes(currentRole);
      case 'facilities':
        return ['ADMIN_PENGINAPAN', 'RESEPSIONIS', 'PIMPINAN'].includes(currentRole);
      case 'housekeeping':
      case 'maintenance':
        return ['ADMIN_PENGINAPAN', 'HOUSEKEEPING'].includes(currentRole);
      case 'rates':
      case 'invoices':
      case 'payments':
        return ['ADMIN_PENGINAPAN', 'KEUANGAN', 'RESEPSIONIS', 'PIMPINAN'].includes(currentRole);
      case 'reports':
        return ['ADMIN_PENGINAPAN', 'KEUANGAN', 'PIMPINAN'].includes(currentRole);
      case 'master-institutions':
      case 'master-room-types':
        return currentRole === 'ADMIN_PENGINAPAN';
      case 'system-users':
      case 'audit-logs':
      case 'settings':
        return false;
      default:
        return false;
    }
  };

  // Section Visibility Computations
  const hasUtamaSection = canAccess('dashboard') || canAccess('executive-dashboard');
  const hasOperasionalSection = 
    canAccess('frontdesk-pos') || canAccess('reservations') || canAccess('reservation-calendar') || 
    canAccess('checkin') || canAccess('checkout') || canAccess('room-assignment') || 
    canAccess('guests') || canAccess('groups');
  const hasPenginapanSection = 
    canAccess('room-status-board') || canAccess('buildings') || canAccess('rooms') || 
    canAccess('beds') || canAccess('facilities');
  const hasKamarOpsSection = canAccess('housekeeping') || canAccess('maintenance');
  const hasKeuanganSection = canAccess('rates') || canAccess('invoices') || canAccess('payments');
  const hasLaporanSection = canAccess('reports');
  const hasMasterSection = canAccess('master-institutions') || canAccess('master-room-types');
  const hasSistemSection = canAccess('system-users') || canAccess('audit-logs') || canAccess('settings');

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-gradient-to-b from-[#1A1410] via-[#2A2018] to-[#1A1410] text-white border-r border-[#c9a961]/20 shadow-2xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Kiswah Gold Accent Bar (siap-haji-papua.vercel.app) */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#c9a961] via-[#d4af37] to-[#b8941e]" />

        {/* Brand / Logo */}
        <div className="p-4 border-b border-[#c9a961]/20 flex items-center justify-between">
          <div 
            onClick={() => handleNav(currentRole === 'RESEPSIONIS' ? 'frontdesk-pos' : currentRole === 'HOUSEKEEPING' ? 'housekeeping' : currentRole === 'PIMPINAN' ? 'executive-dashboard' : 'dashboard')} 
            className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
          >
            {/* Islamic Kiswah Emblem Motif */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c9a961] via-[#d4af37] to-[#b8941e] p-0.5 shadow-md shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#1A1410] rounded-[10px] flex items-center justify-center text-[#c9a961] font-bold text-lg">
                <Compass className="w-5 h-5 text-[#c9a961] animate-pulse" />
              </div>
            </div>

            {!collapsed && (
              <div className="leading-tight truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-wider text-base text-white">SIMAHA</span>
                  <span className="font-bold text-[#c9a961] text-xs px-1.5 py-0.5 rounded bg-[#c9a961]/20 border border-[#c9a961]/40">PAPUA</span>
                </div>
                <p className="text-[10px] text-stone-300 font-medium truncate mt-0.5">Sistem Informasi Manajemen Asrama Haji</p>
                <p className="text-[9px] text-[#c9a961]/90 font-medium truncate">Provinsi Papua</p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#c9a961]/10 transition-colors"
            title={collapsed ? 'Perluas Menu' : 'Perkecil Menu'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 custom-scrollbar">
          {/* UTAMA */}
          {hasUtamaSection && (
            <div>
              {!collapsed && <p className="px-3 text-[10px] font-bold text-[#c9a961]/80 uppercase tracking-wider mb-1">Utama</p>}
              <ul className="space-y-1">
                {canAccess('dashboard') && (
                  <li>
                    <div onClick={() => handleNav('dashboard')} className={navItemClass('dashboard')} title="Dashboard Operasional">
                      <LayoutDashboard className="w-4 h-4 shrink-0 text-[#c9a961]" />
                      {!collapsed && <span>Dashboard Operasional</span>}
                    </div>
                  </li>
                )}
                {canAccess('executive-dashboard') && (
                  <li>
                    <div onClick={() => handleNav('executive-dashboard')} className={navItemClass('executive-dashboard')} title="Dashboard Pimpinan">
                      <Award className="w-4 h-4 shrink-0 text-[#c9a961]" />
                      {!collapsed && <span className="text-[#c9a961] font-bold">Dashboard Pimpinan</span>}
                    </div>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* OPERASIONAL */}
          {hasOperasionalSection && (
            <div>
              {!collapsed ? (
                <div 
                  onClick={() => toggleSection('operasional')} 
                  className="flex items-center justify-between px-3 py-1 cursor-pointer text-[10px] font-bold text-[#c9a961]/80 uppercase tracking-wider select-none hover:text-[#c9a961]"
                >
                  <span>Operasional</span>
                  {openSections.operasional ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              ) : null}

              {(collapsed || openSections.operasional) && (
                <ul className="space-y-1 mt-1">
                  {canAccess('frontdesk-pos') && (
                    <li>
                      <div 
                        onClick={() => handleNav('frontdesk-pos')} 
                        className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                          currentPage === 'frontdesk-pos'
                            ? 'bg-gradient-to-r from-[#c9a961] to-[#b8941e] text-white font-bold shadow-md shadow-[#c9a961]/30'
                            : 'bg-[#2A2018] text-[#c9a961] hover:bg-[#382b20] hover:text-white border border-[#c9a961]/30'
                        }`} 
                        title="Kasir & Transaksi Resepsionis (Front Desk POS)"
                      >
                        <Receipt className="w-4 h-4 shrink-0 text-[#c9a961] animate-pulse" />
                        {!collapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold">Kasir Resepsionis (POS)</span>
                            <span className="text-[9px] bg-[#c9a961] text-[#1A1410] font-black px-1.5 py-0.2 rounded">KASIR</span>
                          </div>
                        )}
                      </div>
                    </li>
                  )}
                  {canAccess('reservations') && (
                    <li>
                      <div onClick={() => handleNav('reservations')} className={navItemClass('reservations')} title="Reservasi">
                        <CalendarCheck className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Reservasi</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('reservation-calendar') && (
                    <li>
                      <div onClick={() => handleNav('reservation-calendar')} className={navItemClass('reservation-calendar')} title="Bagan Jadwal / Tape Chart (Room Rack)">
                        <CalendarDays className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Tape Chart & Kalender</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('checkin') && (
                    <li>
                      <div onClick={() => handleNav('checkin')} className={navItemClass('checkin')} title="Check-in">
                        <LogIn className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Check-in Tamu</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('checkout') && (
                    <li>
                      <div onClick={() => handleNav('checkout')} className={navItemClass('checkout')} title="Check-out">
                        <LogOut className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Check-out Tamu</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('room-assignment') && (
                    <li>
                      <div onClick={() => handleNav('room-assignment')} className={navItemClass('room-assignment')} title="Penempatan Kamar">
                        <UserCheck className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Penempatan Kamar</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('guests') && (
                    <li>
                      <div onClick={() => handleNav('guests')} className={navItemClass('guests')} title="Data Tamu">
                        <Users className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Data Tamu</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('groups') && (
                    <li>
                      <div onClick={() => handleNav('groups')} className={navItemClass('groups')} title="Rombongan">
                        <Briefcase className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Rombongan</span>}
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* PENGINAPAN */}
          {hasPenginapanSection && (
            <div>
              {!collapsed ? (
                <div 
                  onClick={() => toggleSection('penginapan')} 
                  className="flex items-center justify-between px-3 py-1 cursor-pointer text-[10px] font-bold text-[#c9a961]/70 uppercase tracking-wider select-none hover:text-[#c9a961]"
                >
                  <span>Penginapan & Kamar</span>
                  {openSections.penginapan ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              ) : null}

              {(collapsed || openSections.penginapan) && (
                <ul className="space-y-1 mt-1">
                  {canAccess('room-status-board') && (
                    <li>
                      <div onClick={() => handleNav('room-status-board')} className={navItemClass('room-status-board')} title="Status Kamar (Room Board)">
                        <Hotel className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span className="font-semibold text-amber-200">Room Status Board</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('buildings') && (
                    <li>
                      <div onClick={() => handleNav('buildings')} className={navItemClass('buildings')} title="Gedung">
                        <Building2 className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Gedung</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('rooms') && (
                    <li>
                      <div onClick={() => handleNav('rooms')} className={navItemClass('rooms')} title="Kamar">
                        <BedDouble className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Data Kamar</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('beds') && (
                    <li>
                      <div onClick={() => handleNav('beds')} className={navItemClass('beds')} title="Tempat Tidur (Bed)">
                        <Layers className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Tempat Tidur (Bed)</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('facilities') && (
                    <li>
                      <div onClick={() => handleNav('facilities')} className={navItemClass('facilities')} title="Fasilitas Asrama">
                        <Landmark className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Fasilitas & Aula</span>}
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* OPERASIONAL KAMAR (HOUSEKEEPING & MAINTENANCE) */}
          {hasKamarOpsSection && (
            <div>
              {!collapsed ? (
                <div 
                  onClick={() => toggleSection('kamarOps')} 
                  className="flex items-center justify-between px-3 py-1 cursor-pointer text-[10px] font-bold text-[#c9a961]/70 uppercase tracking-wider select-none hover:text-[#c9a961]"
                >
                  <span>Operasional Kamar</span>
                  {openSections.kamarOps ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              ) : null}

              {(collapsed || openSections.kamarOps) && (
                <ul className="space-y-1 mt-1">
                  {canAccess('housekeeping') && (
                    <li>
                      <div onClick={() => handleNav('housekeeping')} className={navItemClass('housekeeping')} title="Housekeeping">
                        <Sparkles className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Housekeeping</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('maintenance') && (
                    <li>
                      <div onClick={() => handleNav('maintenance')} className={navItemClass('maintenance')} title="Maintenance">
                        <Wrench className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Maintenance & Kerusakan</span>}
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* KEUANGAN */}
          {hasKeuanganSection && (
            <div>
              {!collapsed ? (
                <div 
                  onClick={() => toggleSection('keuangan')} 
                  className="flex items-center justify-between px-3 py-1 cursor-pointer text-[10px] font-bold text-[#c9a961]/70 uppercase tracking-wider select-none hover:text-[#c9a961]"
                >
                  <span>Keuangan</span>
                  {openSections.keuangan ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              ) : null}

              {(collapsed || openSections.keuangan) && (
                <ul className="space-y-1 mt-1">
                  {canAccess('rates') && (
                    <li>
                      <div onClick={() => handleNav('rates')} className={navItemClass('rates')} title="Master Tarif">
                        <Receipt className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Tarif Kamar & Fasilitas</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('invoices') && (
                    <li>
                      <div onClick={() => handleNav('invoices')} className={navItemClass('invoices')} title="Tagihan & Invoice">
                        <FileText className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Tagihan & Invoice</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('payments') && (
                    <li>
                      <div onClick={() => handleNav('payments')} className={navItemClass('payments')} title="Pembayaran & Kwitansi">
                        <CreditCard className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Pembayaran & Kwitansi</span>}
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* LAPORAN */}
          {hasLaporanSection && (
            <div>
              {!collapsed ? (
                <div 
                  onClick={() => toggleSection('laporan')} 
                  className="flex items-center justify-between px-3 py-1 cursor-pointer text-[10px] font-bold text-[#c9a961]/70 uppercase tracking-wider select-none hover:text-[#c9a961]"
                >
                  <span>Laporan Manajemen</span>
                  {openSections.laporan ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              ) : null}

              {(collapsed || openSections.laporan) && (
                <ul className="space-y-1 mt-1">
                  {canAccess('reports') && (
                    <li>
                      <div onClick={() => handleNav('reports')} className={navItemClass('reports')} title="Semua Laporan">
                        <BarChart3 className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Laporan Terpadu</span>}
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* MASTER DATA */}
          {hasMasterSection && (
            <div>
              {!collapsed ? (
                <div 
                  onClick={() => toggleSection('master')} 
                  className="flex items-center justify-between px-3 py-1 cursor-pointer text-[10px] font-bold text-[#c9a961]/70 uppercase tracking-wider select-none hover:text-[#c9a961]"
                >
                  <span>Master Data</span>
                  {openSections.master ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              ) : null}

              {(collapsed || openSections.master) && (
                <ul className="space-y-1 mt-1">
                  {canAccess('master-institutions') && (
                    <li>
                      <div onClick={() => handleNav('master-institutions')} className={navItemClass('master-institutions')} title="Instansi">
                        <Landmark className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Instansi & Lembaga</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('master-room-types') && (
                    <li>
                      <div onClick={() => handleNav('master-room-types')} className={navItemClass('master-room-types')} title="Jenis Kamar">
                        <BedDouble className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Jenis Kamar</span>}
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* SISTEM & KEAMANAN (SUPER ADMIN ONLY) */}
          {hasSistemSection && (
            <div>
              {!collapsed ? (
                <div 
                  onClick={() => toggleSection('sistem')} 
                  className="flex items-center justify-between px-3 py-1 cursor-pointer text-[10px] font-bold text-[#c9a961]/70 uppercase tracking-wider select-none hover:text-[#c9a961]"
                >
                  <span>Sistem & Keamanan</span>
                  {openSections.sistem ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              ) : null}

              {(collapsed || openSections.sistem) && (
                <ul className="space-y-1 mt-1">
                  {canAccess('system-users') && (
                    <li>
                      <div onClick={() => handleNav('system-users')} className={navItemClass('system-users')} title="Pengguna & Role">
                        <UserCog className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Pengguna & Role</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('audit-logs') && (
                    <li>
                      <div onClick={() => handleNav('audit-logs')} className={navItemClass('audit-logs')} title="Audit Log">
                        <History className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Audit Log Sistem</span>}
                      </div>
                    </li>
                  )}
                  {canAccess('settings') && (
                    <li>
                      <div onClick={() => handleNav('settings')} className={navItemClass('settings')} title="Pengaturan">
                        <Settings className="w-4 h-4 shrink-0 text-[#c9a961]" />
                        {!collapsed && <span>Pengaturan Sistem</span>}
                      </div>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Public Landing Portal Preview Button */}
        <div className="p-3 pb-0 bg-[#1A1410]/80">
          <button
            onClick={() => {
              onNavigate('landing');
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white hover:bg-[#c9a961]/15 bg-[#2A2018]/60 border border-[#c9a961]/20 transition-all text-left"
            title="Buka Beranda Publik (Landing Page)"
          >
            <Compass className="w-4 h-4 text-[#c9a961] shrink-0" />
            {!collapsed && <span>Beranda Publik</span>}
          </button>
        </div>

        {/* Help & SOP Button */}
        <div className="p-3 border-t border-[#c9a961]/20 bg-[#1A1410]/80">
          <button
            onClick={() => {
              if (onOpenHelpGuide) onOpenHelpGuide();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#c9a961] hover:bg-[#c9a961]/20 bg-[#c9a961]/10 border border-[#c9a961]/30 transition-all text-left"
            title="Buku Panduan & SOP Operasional SIPAH"
          >
            <BookOpen className="w-4 h-4 text-[#c9a961] shrink-0" />
            {!collapsed && <span>Buku Panduan SOP</span>}
          </button>
        </div>

        {/* Sidebar Footer: Role Indicator & Version */}
        <div className="p-3 border-t border-[#c9a961]/20 bg-[#1A1410] text-[10px] text-stone-400 flex items-center justify-between">
          {!collapsed ? (
            <>
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-[#c9a961] inline-block shrink-0 shadow-[0_0_6px_#c9a961]" />
                <span className="font-bold text-[#c9a961] truncate">{currentRole}</span>
              </div>
              <span className="font-mono text-[9px] bg-[#2A2018] px-1.5 py-0.5 rounded text-[#c9a961] border border-[#c9a961]/20 shrink-0">SIPAH</span>
            </>
          ) : (
            <div className="mx-auto w-2 h-2 rounded-full bg-[#c9a961] shadow-[0_0_6px_#c9a961]" />
          )}
        </div>
      </aside>
    </>
  );
};
