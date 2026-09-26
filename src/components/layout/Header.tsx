import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, Search, Bell, Clock, ChevronDown, CheckCircle, 
  RotateCcw, Sparkles, LogOut, User as UserIcon, Shield, BookOpen, Receipt
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
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 shadow-sm">
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
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 text-xs text-slate-500 cursor-pointer transition-all w-64 md:w-80 group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
          <span className="truncate">Cari reservasi, tamu, rombongan, kamar...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400">
            ⌘K
          </kbd>
        </div>

        {/* Mobile Search Icon */}
        <button
          onClick={onOpenGlobalSearch}
          className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right Area: Time, Reseed Button, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* WIT Clock */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 font-medium">
          <Clock className="w-3.5 h-3.5 text-emerald-800" />
          <span>{currentTime}</span>
        </div>

        {/* Kasir Resepsionis POS Quick Button (Only for Receptionist & Admins) */}
        {['SUPER_ADMIN', 'ADMIN_PENGINAPAN', 'RESEPSIONIS'].includes(currentRole) && (
          <button
            onClick={() => onNavigate('frontdesk-pos')}
            title="Buka Kasir & Transaksi Resepsionis 1-Klik (Front Desk POS)"
            className="flex items-center gap-1.5 text-[11px] font-black text-slate-950 bg-amber-400 hover:bg-amber-500 border border-amber-500/50 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all shadow-xs group"
          >
            <Receipt className="w-3.5 h-3.5 text-slate-900 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Kasir Resepsionis</span>
          </button>
        )}

        {/* Cek Kamar Mandiri Munakosah Papua */}
        <button
          onClick={() => setIsMunakosahOpen(true)}
          title="Anjungan Cek Kamar Mandiri Jemaah & Tamu (Munakosah Papua)"
          className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors shadow-2xs group"
        >
          <span className="text-sm">🕋</span>
          <span className="hidden sm:inline">Cek Kamar Jemaah</span>
        </button>

        {/* Help Guide SOP Button */}
        <button
          onClick={onOpenHelpGuide}
          title="Buka Buku Panduan & SOP Operasional SIPAH (F1 atau ?)"
          className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">Panduan SOP</span>
        </button>

        {/* Demo Data Reset Button (Super Admin Only) */}
        {currentRole === 'SUPER_ADMIN' && (
          <button
            onClick={handleResetData}
            title="Reset database ke Demo Seed Data (Super Admin Only)"
            className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>Reset Demo Data</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-emerald-800 transition-colors"
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
                    className="text-[11px] text-emerald-800 font-semibold hover:underline"
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
                        !n.is_read ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-emerald-600 ring-4 ring-emerald-100' : 'bg-slate-300'}`} />
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
            className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[130px]">{currentUser?.name}</p>
              <p className="text-[10px] font-semibold text-emerald-800">
                {roleLabels[currentRole] || currentRole}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-amber-50/50 rounded-xl mb-2 border border-emerald-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-600 truncate">{currentUser?.email}</p>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-800 text-white px-2 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  {roleLabels[currentRole]}
                </div>
              </div>

              {/* Role Switcher for Instant Testing */}
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser?.id === u.id
                        ? 'bg-emerald-800 text-white font-semibold'
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
                  logout();
                  setShowUserMenu(false);
                  toast.info('Keluar', 'Anda telah keluar dari aplikasi.');
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
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
