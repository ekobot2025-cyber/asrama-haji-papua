import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, Filter, Phone, Mail, 
  MapPin, Building, ShieldCheck, Eye, Edit, Trash2 
} from 'lucide-react';
import { db } from '../../db/database';
import { Guest, Institution, GuestType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { maskNik, formatDateIndo } from '../../utils/formatters';

export const GuestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    nik: '',
    full_name: '',
    gender: 'L' as 'L' | 'P',
    phone: '',
    email: '',
    institution_id: '',
    guest_type: 'JAMAAH' as GuestType,
    regency_city: 'Kota Jayapura',
    province: 'Papua',
    address: '',
    notes: '',
  });

  const loadData = () => {
    setGuests(db.getGuests());
    setInstitutions(db.getInstitutions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (guest?: Guest) => {
    if (guest) {
      setEditingGuest(guest);
      setFormData({
        nik: guest.nik,
        full_name: guest.full_name,
        gender: guest.gender,
        phone: guest.phone,
        email: guest.email || '',
        institution_id: guest.institution_id || '',
        guest_type: guest.guest_type,
        regency_city: guest.regency_city,
        province: guest.province,
        address: guest.address,
        notes: guest.notes || '',
      });
    } else {
      setEditingGuest(null);
      setFormData({
        nik: '',
        full_name: '',
        gender: 'L',
        phone: '',
        email: '',
        institution_id: '',
        guest_type: 'JAMAAH',
        regency_city: 'Kota Jayapura',
        province: 'Papua',
        address: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone) {
      toast.error('Gagal', 'Nama lengkap dan nomor HP wajib diisi.');
      return;
    }

    const saved = db.saveGuest({
      id: editingGuest?.id,
      nik: formData.nik || '917101' + Math.floor(Math.random() * 10000000000),
      full_name: formData.full_name,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      institution_id: formData.institution_id || undefined,
      guest_type: formData.guest_type,
      regency_city: formData.regency_city,
      province: formData.province,
      address: formData.address,
      notes: formData.notes,
    });

    toast.success('Tamu Tersimpan', `Data tamu ${saved.full_name} berhasil disimpan.`);
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteGuest = () => {
    if (!deleteTarget) return;

    const res = db.deleteGuest(deleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Tamu Dihapus', res.message);
      setDeleteTarget(null);
      loadData();
    } else {
      toast.error('Gagal Menghapus', res.message);
      setDeleteTarget(null);
    }
  };

  const getInstitutionName = (instId?: string) => {
    if (!instId) return '-';
    return institutions.find((i) => i.id === instId)?.name || '-';
  };

  const filtered = guests.filter((g) => {
    const matchSearch =
      g.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.nik.includes(searchTerm) ||
      g.phone.includes(searchTerm) ||
      g.regency_city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'all' || g.guest_type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-800" />
            Database Tamu & Jamaah (Guest Directory)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas tamu terlindungi (masking NIK aman), riwayat menginap, dan pengelompokan asal daerah se-Papua.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Tamu Baru
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama tamu, NIK, nomor HP, asal daerah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="all">Semua Tipe Tamu</option>
            <option value="JAMAAH">Jamaah Haji / Umrah</option>
            <option value="KEDINASAN">Tamu Kedinasan</option>
            <option value="MANASIK">Peserta Manasik</option>
            <option value="PELATIHAN">Peserta Pelatihan</option>
            <option value="PEGAWAI">Pegawai Kemenag</option>
            <option value="UMUM">Umum / Masyarakat</option>
          </select>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">NIK (Terproteksi)</th>
                <th className="py-3 px-4 text-center">L/P</th>
                <th className="py-3 px-4">Kontak (HP/WA)</th>
                <th className="py-3 px-4">Instansi</th>
                <th className="py-3 px-4">Daerah Asal</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Riwayat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {g.full_name}
                    {g.notes && <p className="text-[10px] text-slate-400 font-normal mt-0.5 truncate max-w-[200px]">{g.notes}</p>}
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-600">
                    {maskNik(g.nik)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      g.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {g.gender}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {g.phone}
                  </td>

                  <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                    {getInstitutionName(g.institution_id)}
                  </td>

                  <td className="py-3 px-4 text-slate-800">
                    <p className="font-semibold">{g.regency_city}</p>
                    <p className="text-[10px] text-slate-400">{g.province}</p>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {g.guest_type}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {g.stay_count} Kali
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenModal(g)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                        title="Edit Data Tamu"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(g)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        title="Hapus Data Tamu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Tamu */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGuest ? 'Edit Data Tamu' : 'Tambah Data Tamu Baru'}
        subtitle="Identitas Tamu Terintegrasi UPT Asrama Haji Papua"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveGuest} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                placeholder="Nama sesuai KTP"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NIK (16 Digit) *</label>
              <input
                type="text"
                maxLength={16}
                placeholder="917101xxxxxx0003"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor HP / WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="0812-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Tamu *</label>
              <select
                value={formData.guest_type}
                onChange={(e) => setFormData({ ...formData, guest_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="JAMAAH">Jamaah Haji / Umrah</option>
                <option value="KEDINASAN">Tamu Kedinasan</option>
                <option value="MANASIK">Peserta Manasik</option>
                <option value="PELATIHAN">Peserta Pelatihan</option>
                <option value="PEGAWAI">Pegawai Kemenag</option>
                <option value="UMUM">Umum</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kabupaten / Kota Asal *</label>
              <input
                type="text"
                required
                placeholder="Kota Jayapura / Merauke / Mimika"
                value={formData.regency_city}
                onChange={(e) => setFormData({ ...formData, regency_city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Provinsi *</label>
              <input
                type="text"
                required
                placeholder="Papua / Papua Selatan / Papua Tengah"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Instansi Asal</label>
            <select
              value={formData.institution_id}
              onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
            >
              <option value="">-- Mandiri / Umum --</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Khusus</label>
            <input
              type="text"
              placeholder="Riwayat penyakit / alergi / peranan dalam kegiatan"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Data Tamu
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteGuest}
        title="Hapus Data Tamu"
        message={`Apakah Anda yakin ingin menghapus data tamu "${deleteTarget?.full_name}"? Riwayat dan catatan terkait tamu ini akan dihapus dari buku tamu.`}
        confirmText="Hapus Tamu"
        variant="danger"
      />
    </div>
  );
};
