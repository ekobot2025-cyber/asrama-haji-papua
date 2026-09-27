import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, Bell, Clock, ChevronDown, CheckCircle, 
  RotateCcw, Sparkles, LogOut, User as UserIcon, Shield, BookOpen, Receipt, Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../db/database';
import { SelfServiceLookupModal } from '../operations/SelfServiceLookupModal';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenGlobalSearch: () => void;
  onOpenHelpGuide: () => void;
  onNavigate: (page: string, targetId?: string) => void;
  collapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenGlobalSearch,
  onOpenHelpGuide,
  onNavigate,
  collapsed,
}) => {
  const { currentUser, currentRole, switchUser, users, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const toast = useToast();

  const [currentTime, setCurrentTime] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMunakosahOpen, setIsMunakosahOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Update clock in Asia/Jayapura (WIT)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Formatted in Indonesian with WIT
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      const dayName = days[now.getDay()];
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      setCurrentTime(`${dayName}, ${day} ${month} ${year} • ${hours}:${minutes}:${seconds} WIT`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin memuat ulang DEMO DATA awal UPT Asrama Haji Papua? Seluruh data perubahan akan di-reset ke nilai default.')) {
      db.initialize(true);
      refreshNotifications();
      toast.success('Database Berhasil Direset', 'Semua data kamar, rombongan, reservasi, dan transaksi dikembalikan ke seed data.');
      window.location.reload();
    }
  };

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin (IT)',
    ADMIN_PENGINAPAN: 'Admin Penginapan',
    RESEPSIONIS: 'Front Desk / Resepsionis',
    PETUGAS: 'Petugas Pelayanan',
    KEUANGAN: 'Bendahara Keuangan',
    HOUSEKEEPING: 'Housekeeping',
    PIMPINAN: 'Pimpinan (Ka. UPT)',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-xl sm:px-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      {/* Left Area: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div 
          onClick={onOpenGlobalSearch}
          className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100/70 hover:bg-slate-100 border border-slate-200/70 text-xs text-slate-500 cursor-pointer transition-all duration-200 w-36 md:w-52 lg:w-60 xl:w-64 group shrink ring-1 ring-transparent hover:ring-blue-700/20"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700 transition-colors shrink-0" />
          <span className="truncate">Cari data sistem...</span>
          <kbd className="ml-auto text-[9px] font-mono bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-400 shrink-0 shadow-2xs">
            ⌘K
          </kbd>
        </div>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenGlobalSearch}
          className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right Area: Time, Reseed Button, Notifications, User Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* WIT Clock with Live Pulse */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 bg-slate-100/70 px-3 py-1.5 rounded-xl border border-slate-200/60 font-medium whitespace-nowrap shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span>{currentTime}</span>
        </div>

        {/* Kasir Resepsionis POS Quick Button (Signature Gradient) */}
        {['SUPER_ADMIN', 'ADMIN_PENGINAPAN', 'RESEPSIONIS'].includes(currentRole) && (
          <button
            onClick={() => onNavigate('frontdesk-pos')}
            title="Buka Kasir & Transaksi Resepsionis 1-Klik (Front Desk POS)"
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1e40af] to-[#059669] hover:from-[#1e3a8a] hover:to-[#047857] border border-blue-700/80 px-3 py-1.5 rounded-xl transition-all shadow-xs hover:shadow-sm group whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-[#c9a961] group-hover:rotate-6 transition-transform shrink-0" />
            <span className="hidden sm:inline">Kasir POS</span>
          </button>
        )}

        {/* Cek Kamar Mandiri Munakosah Papua */}
        <button
          onClick={() => setIsMunakosahOpen(true)}
          title="Anjungan Cek Kamar Mandiri Jemaah & Tamu (Munakosah Papua)"
          className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-900 bg-slate-100/80 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span className="text-xs shrink-0">🕋</span>
          <span className="hidden sm:inline">Cek Kamar</span>
        </button>

        {/* Help Guide SOP Button */}
        <button
          onClick={onOpenHelpGuide}
          title="Buka Buku Panduan & SOP Operasional SIPAH (F1 atau ?)"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-900 bg-slate-100/80 hover:bg-blue-50/80 border border-slate-200/70 hover:border-blue-200 px-3 py-1.5 rounded-xl transition-all shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>Panduan SOP</span>
        </button>

        {/* Demo Data Reset Button (Super Admin Only) */}
        {currentRole === 'SUPER_ADMIN' && (
          <button
            onClick={handleResetData}
            title="Reset database ke Demo Seed Data (Super Admin Only)"
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-amber-800 hover:text-amber-900 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/70 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Reset Demo</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-800 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200 p-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifikasi Operasional</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-blue-700 font-semibold hover:underline"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">Tidak ada notifikasi saat ini.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link_page) onNavigate(n.link_page, n.link_id);
                        setShowNotifMenu(false);
                      }}
                      className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                        !n.is_read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'}`} />
                      <div className="flex-1">
                        <p className={`font-semibold ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Quick Role Switcher */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl hover:bg-slate-100/80 transition-colors text-left shrink-0 whitespace-nowrap cursor-pointer border border-transparent hover:border-slate-200/60"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1e40af] to-[#059669] text-white font-bold flex items-center justify-center text-xs shadow-xs ring-2 ring-blue-600/20 shrink-0">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{currentUser?.name}</p>
              <p className="text-[10px] font-semibold text-blue-700 truncate max-w-[120px]">
                {roleLabels[currentRole] || currentRole}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-200/80 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 bg-gradient-to-br from-blue-50/80 via-slate-50 to-[#fff8e7] rounded-xl mb-2 border border-blue-100/80">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-600 truncate">{currentUser?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold bg-gradient-to-r from-[#1e40af] to-[#059669] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                  <Shield className="w-3 h-3 text-[#c9a961]" />
                  {roleLabels[currentRole]}
                </div>
              </div>

              {/* Role Switcher for Instant Testing */}
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ganti Role Pengguna (Demo):
              </div>
              <div className="space-y-0.5">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowUserMenu(false);
                      toast.info(`Beralih Peran`, `Sekarang login sebagai ${u.name} (${roleLabels[u.role]})`);
                      
                      // Auto-navigate to primary workspace for selected role
                      const defaultPage = 
                        u.role === 'HOUSEKEEPING' ? 'housekeeping' :
                        u.role === 'RESEPSIONIS' ? 'frontdesk-pos' :
                        u.role === 'KEUANGAN' ? 'invoices' :
                        u.role === 'PIMPINAN' ? 'executive-dashboard' :
                        'dashboard';
                      onNavigate(defaultPage);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                      currentUser?.id === u.id
                        ? 'bg-gradient-to-r from-[#1e40af] to-[#059669] text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{roleLabels[u.role] || u.name}</span>
                    {currentUser?.id === u.id && <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                ))}
              </div>

              <div className="my-1.5 border-t border-slate-100" />

              <button
                onClick={() => {
                  onNavigate('landing');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-blue-800 hover:bg-blue-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-blue-700" />
                <span>Lihat Beranda Publik (Landing)</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                  toast.info('Keluar', 'Anda telah keluar dari aplikasi.');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Aplikasi</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Modal Anjungan Cek Kamar Mandiri Munakosah */}
      <SelfServiceLookupModal
        isOpen={isMunakosahOpen}
        onClose={() => setIsMunakosahOpen(false)}
      />
    </header>
  );
};
