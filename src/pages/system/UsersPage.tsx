import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Shield, CheckCircle2, Lock, Edit, Trash2 } from 'lucide-react';
import { db } from '../../db/database';
import { User, UserRole } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDateTimeIndo } from '../../utils/formatters';

export const UsersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'PETUGAS' as UserRole,
    department: 'Front Desk & Pelayanan',
    phone: '',
    status: 'ACTIVE' as User['status'],
  });

  const loadData = () => {
    setUsers(db.getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (usr?: User) => {
    if (usr) {
      setEditingUser(usr);
      setFormData({
        username: usr.username,
        name: usr.name,
        email: usr.email,
        role: usr.role,
        department: usr.department || '',
        phone: usr.phone || '',
        status: usr.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        name: '',
        email: '',
        role: 'PETUGAS',
        department: 'Front Desk & Pelayanan',
        phone: '',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username) {
      toast.error('Gagal', 'Username dan nama lengkap wajib diisi.');
      return;
    }

    db.saveUser({
      id: editingUser?.id,
      username: formData.username.toLowerCase().trim(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      phone: formData.phone,
      status: formData.status,
    }, currentUser || undefined);

    toast.success(
      editingUser ? 'Pengguna Diperbarui' : 'Pengguna Ditambahkan',
      `Akun pengguna ${formData.name} berhasil disimpan.`
    );
    setIsModalOpen(false);
    loadData();
  };

  const isHousekeeping = currentUser?.role === 'HOUSEKEEPING';

  const handleDeleteUser = () => {
    if (isHousekeeping) {
      toast.error('Akses Ditolak', 'Petugas Housekeeping tidak diizinkan menghapus data pengguna sistem.');
      setDeleteTarget(null);
      return;
    }

    if (!deleteTarget) return;

    const res = db.deleteUser(deleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Pengguna Dihapus', res.message);
      setDeleteTarget(null);
      loadData();
    } else {
      toast.error('Gagal Menghapus', res.message);
      setDeleteTarget(null);
    }
  };

  const roleDescriptions: Record<UserRole, string> = {
    SUPER_ADMIN: 'Akses penuh ke seluruh konfigurasi sistem, database, audit log, dan master data.',
    ADMIN_PENGINAPAN: 'Kelola reservasi, alokasi kamar, verifikasi tamu, dan monitoring operasional.',
    RESEPSIONIS: 'Front desk kasir: transaksi 1-layar kilat, check-in walk-in, pembayaran kasir, dan serah terima kunci.',
    PETUGAS: 'Front desk: proses reservasi harian, check-in, check-out, serah terima kunci kartu.',
    KEUANGAN: 'Penerbitan invoice tagihan, penerimaan pembayaran kasir, pencetakan kwitansi & laporan PNBP.',
    HOUSEKEEPING: 'Pembaruan status kebersihan kamar (Dirty, Cleaning, Inspected, Ready).',
    PIMPINAN: 'Hak akses Executive Dashboard dan laporan operasional menyeluruh (Read-only).',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#8a6d2b]" />
            Manajemen Pengguna & Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengaturan peran pengguna dan hak akses granular petugas UPT Asrama Haji Provinsi Papua.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Pengguna Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((u) => (
          <div
            key={u.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow text-xs group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-slate-400">@{u.username}</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  u.status === 'ACTIVE' 
                    ? 'text-[#8a6d2b] bg-[#fbf8ee] border border-[#e8dfc8]' 
                    : 'text-slate-600 bg-slate-100'
                }`}>
                  <CheckCircle2 className="w-3 h-3" /> {u.status}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#c9a961] text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-900 truncate text-sm">{u.name}</h3>
                  <p className="text-slate-500 truncate text-[11px]">{u.email}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Peran / Role:</span>
                  <span className="font-bold text-[#8a6d2b] bg-[#f4ebd0] px-2 py-0.5 rounded">
                    {u.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {roleDescriptions[u.role]}
                </p>
              </div>
            </div>

            <div>
              <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Login Terakhir:</span>
                <span className="font-medium text-slate-600">
                  {u.last_login ? formatDateTimeIndo(u.last_login) : '-'}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenModal(u)}
                  icon={<Edit className="w-3.5 h-3.5 text-slate-600" />}
                >
                  Edit Akun
                </Button>
                {u.role !== 'SUPER_ADMIN' && !isHousekeeping && (
                  <button
                    onClick={() => setDeleteTarget(u)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    title="Hapus Akun Pengguna"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Pengguna */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit Pengguna: ${editingUser.name}` : 'Tambah Pengguna Sistem Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Username *</label>
              <input
                type="text"
                required
                placeholder="petugas_desk"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Peran / Hak Akses *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961]"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Semua Modul & Konfigurasi)</option>
                <option value="ADMIN_PENGINAPAN">ADMIN_PENGINAPAN (Reservasi & Alokasi)</option>
                <option value="PETUGAS">PETUGAS (Front Desk & Check-in)</option>
                <option value="KEUANGAN">KEUANGAN (Kasir, Invoice & Kwitansi)</option>
                <option value="HOUSEKEEPING">HOUSEKEEPING (Kebersihan Kamar)</option>
                <option value="PIMPINAN">PIMPINAN (Executive Dashboard & Laporan)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Petugas *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Muhammad Ramadhan, S.Sos"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                placeholder="petugas@kemenag.go.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                placeholder="0812-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Divisi / Bagian</label>
              <input
                type="text"
                placeholder="Front Desk / Kasir / Housekeeping"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Akun</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961]"
              >
                <option value="ACTIVE">ACTIVE (Dapat Login)</option>
                <option value="INACTIVE">INACTIVE (Dibekukan)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Simpan Perubahan' : 'Simpan Pengguna'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun pengguna "${deleteTarget?.name}" (@${deleteTarget?.username})?`}
        confirmText="Hapus Pengguna"
        variant="danger"
      />
    </div>
  );
};
