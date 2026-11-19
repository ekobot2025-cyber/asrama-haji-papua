import React, { useState, useEffect } from 'react';
import { Settings, Save, Landmark, Building, Phone, Mail, UserCheck, RotateCcw, Database, CheckCircle2 } from 'lucide-react';
import { db } from '../../db/database';
import { AppSettings } from '../../types';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [settings, setSettings] = useState<AppSettings>(db.getSettings());

  useEffect(() => {
    setSettings(db.getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    db.updateSettings(settings, currentUser);
    toast.success('Pengaturan Disimpan', 'Identitas instansi dan rekening resmi berhasil diperbarui.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#8a6d2b]" />
            Pengaturan Sistem & Identitas Lembaga
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi nama instansi, alamat resmi, pejabat penandatangan kwitansi, dan nomor rekening penerimaan.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Lembaga */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#8a6d2b]" />
            Identitas Unit Pelaksana Teknis (UPT)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Aplikasi</label>
              <input
                type="text"
                value={settings.app_name}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kepanjangan Nama Aplikasi</label>
              <input
                type="text"
                value={settings.app_title}
                onChange={(e) => setSettings({ ...settings, app_title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Nama Resmi Organisasi Pemerintah *</label>
              <input
                type="text"
                required
                value={settings.organization_name}
                onChange={(e) => setSettings({ ...settings, organization_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Alamat Kantor Lengkap</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon & WhatsApp</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Pejabat Penandatangan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#8a6d2b]" />
            Pejabat Penandatangan Laporan & SK
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Kepala UPT Asrama Haji</label>
              <input
                type="text"
                value={settings.head_officer}
                onChange={(e) => setSettings({ ...settings, head_officer: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIP Kepala UPT</label>
              <input
                type="text"
                value={settings.head_nip}
                onChange={(e) => setSettings({ ...settings, head_nip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Rekening Pembayaran Resmi */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-[#8a6d2b]" />
            Rekening Resmi Penerimaan PNBP (Tercetak di Invoice)
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Rekening Bank Papua (BPD)</label>
              <input
                type="text"
                value={settings.bank_bpd_papua}
                onChange={(e) => setSettings({ ...settings, bank_bpd_papua: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rekening Bank Syariah Indonesia (BSI)</label>
              <input
                type="text"
                value={settings.bank_bsi}
                onChange={(e) => setSettings({ ...settings, bank_bsi: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rekening Bank BRI</label>
              <input
                type="text"
                value={settings.bank_bri}
                onChange={(e) => setSettings({ ...settings, bank_bri: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Manajemen Data Demo Siap Pakai */}
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/50 p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-amber-100">
            <div>
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#8a6d2b]" />
                Manajemen Data Demo Operasional Siap Pakai
              </h3>
              <p className="text-xs text-amber-800/80 mt-1">
                Gunakan fitur ini untuk memuat ulang seluruh data simulasi: reservasi aktif kamar Gedung Mina (Superior & Standar), jadwal check-out hari ini (lunas & kurang bayar), sewa Aula dan Ruang Kelas, tugas housekeeping, serta 8 laporan akuntansi SAP PP 71/2010.
              </p>
            </div>
            <Button
              variant="outline"
              type="button"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5 text-amber-700" />}
              onClick={() => {
                if (confirm('Muat ulang data demo SIMAHA Papua?\n\nSemua perubahan data lokal akan disegarkan kembali ke preset operasional lengkap.')) {
                  db.resetDemoData();
                  toast.success('Data Demo Berhasil Dimuat Ulang', 'Seluruh data kamar, reservasi, jadwal hari ini, dan laporan keuangan telah disegarkan.');
                  setTimeout(() => {
                    window.location.reload();
                  }, 400);
                }
              }}
              className="bg-white border-amber-300 text-amber-900 hover:bg-amber-100/60 font-bold shrink-0"
            >
              Muat Ulang Data Demo
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-amber-900/90 font-medium pt-1">
            <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>5 Kamar In-House Terisi (M101 - M104, M201-M202)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Jadwal Check-out Hari Ini (1 Lunas, 1 Kurang Bayar)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sewa Aula & Ruang Kelas Aktif + SIMPONI MPN-G3</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" type="submit" size="md" icon={<Save className="w-4 h-4" />}>
            Simpan Perubahan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
};
