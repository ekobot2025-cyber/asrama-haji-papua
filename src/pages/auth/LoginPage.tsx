import React, { useState } from 'react';
import { Compass, LogIn, Lock, User as UserIcon, Shield, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';

interface LoginPageProps {
  onBackToLanding?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToLanding }) => {
  const { login, users } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      setLoading(false);
      if (success) {
        toast.success('Selamat Datang', 'Login berhasil. Selamat bertugas di SIMAHA PAPUA.');
      } else {
        toast.error('Login Gagal', 'Username atau kata sandi tidak valid.');
      }
    }, 400);
  };

  const handleQuickLogin = (uname: string) => {
    setUsername(uname);
    setPassword('password123');
    login(uname);
    toast.success('Beralih Akun', `Login otomatis sebagai ${uname}`);
  };

  return (
    <div className="min-h-screen bg-[#1A1410] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Subtle Papuan Gradients & Geometry */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A1410] via-[#2A2018] to-[#1A1410] opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(#c9a961_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

      {/* Decorative Gold Blurs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c9a961]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#b8941e]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Landing Page Button */}
      {onBackToLanding && (
        <div className="relative z-10 w-full max-w-md mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-300 hover:text-white transition-colors bg-[#1A1410]/80 hover:bg-[#2A2018] px-3.5 py-1.5 rounded-full border border-[#c9a961]/30 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#c9a961]" />
            <span>Kembali ke Halaman Beranda</span>
          </button>
          <span className="text-[11px] text-[#c9a961] font-medium">SIMAHA Papua</span>
        </div>
      )}

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#e8dfc8] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-[#c9a961] via-[#d4af37] to-[#b8941e]" />

        <div className="p-6 sm:p-8">
          {/* Logo & Identity */}
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#c9a961] via-[#d4af37] to-[#b8941e] p-0.5 shadow-lg flex items-center justify-center mb-3">
              <div className="w-full h-full bg-[#1A1410] rounded-[14px] flex items-center justify-center text-[#c9a961]">
                <Compass className="w-7 h-7 text-[#c9a961] animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h2 className="text-2xl font-black tracking-wider text-stone-900">SIMAHA</h2>
              <span className="text-xs font-bold bg-[#fbf8ee] text-[#8a6d2b] px-2 py-0.5 rounded border border-[#e8dfc8]">
                PAPUA
              </span>
            </div>
            <p className="text-xs font-bold text-[#8a6d2b]">
              Sistem Informasi Manajemen Asrama Haji
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Provinsi Papua
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1.5">Username / Email Pegawai</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="superadmin / admin / petugas..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#e8dfc8] rounded-xl focus:ring-2 focus:ring-[#c9a961] focus:outline-none bg-[#FAF9F5] text-stone-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1.5">Kata Sandi (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-[#e8dfc8] rounded-xl focus:ring-2 focus:ring-[#c9a961] focus:outline-none bg-[#FAF9F5] text-stone-800 font-medium"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              type="submit"
              loading={loading}
              className="w-full py-3 mt-2 shadow-[0_2px_8px_rgba(201,169,97,0.3)] hover:shadow-[0_4px_12px_rgba(201,169,97,0.4)]"
              icon={<LogIn className="w-4 h-4" />}
            >
              Masuk ke Aplikasi
            </Button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="mt-6 pt-5 border-t border-[#e8dfc8]">
            <p className="text-[10px] font-bold text-[#8a6d2b] uppercase tracking-wider text-center mb-2.5">
              Login Cepat Akun Demo (1-Click):
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin')}
                className="px-2.5 py-1.5 rounded-lg border border-[#e8dfc8] hover:bg-[#fbf8ee] hover:border-[#c9a961] text-stone-700 text-left truncate transition-colors"
              >
                <span className="font-bold block text-stone-900">Super Admin</span>
                <span className="text-[10px] text-stone-500">Akses Penuh IT</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-2.5 py-1.5 rounded-lg border border-[#e8dfc8] hover:bg-[#fbf8ee] hover:border-[#c9a961] text-stone-700 text-left truncate transition-colors"
              >
                <span className="font-bold block text-stone-900">Admin Penginapan</span>
                <span className="text-[10px] text-stone-500">Reservasi & Kamar</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('resepsionis')}
                className="px-2.5 py-1.5 rounded-lg border border-[#e8dfc8] hover:bg-[#fbf8ee] hover:border-[#c9a961] text-stone-700 text-left truncate transition-colors"
              >
                <span className="font-bold block text-stone-900">Petugas Front Office</span>
                <span className="text-[10px] text-stone-500">Check-in / Check-out</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('keuangan')}
                className="px-2.5 py-1.5 rounded-lg border border-[#e8dfc8] hover:bg-[#fbf8ee] hover:border-[#c9a961] text-stone-700 text-left truncate transition-colors"
              >
                <span className="font-bold block text-stone-900">Bendahara PNBP</span>
                <span className="text-[10px] text-stone-500">Kwitansi & Kasir</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('housekeeping')}
                className="px-2.5 py-1.5 rounded-lg border border-[#e8dfc8] hover:bg-[#fbf8ee] hover:border-[#c9a961] text-stone-700 text-left truncate transition-colors"
              >
                <span className="font-bold block text-stone-900">Housekeeping</span>
                <span className="text-[10px] text-stone-500">Kebersihan Kamar</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('pimpinan')}
                className="px-2.5 py-1.5 rounded-lg border border-[#e8dfc8] hover:bg-[#fbf8ee] hover:border-[#c9a961] text-stone-700 text-left truncate transition-colors"
              >
                <span className="font-bold block text-stone-900">Kepala UPT</span>
                <span className="text-[10px] text-stone-500">Executive Read-only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-3 px-6 bg-[#FAF9F5] border-t border-[#e8dfc8] text-center text-[10px] text-stone-500">
          Asrama Haji Provinsi Papua &bull; Zona Waktu WIT (Jayapura)
        </div>
      </div>
    </div>
  );
};
