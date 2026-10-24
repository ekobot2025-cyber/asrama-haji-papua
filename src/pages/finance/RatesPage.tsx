import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Filter, CheckCircle2, XCircle, Edit, Trash2, History, Clock, AlertCircle } from 'lucide-react';
import { db } from '../../db/database';
import { RateItem, RateHistory } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';

export const RatesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [rates, setRates] = useState<RateItem[]>([]);
  const [rateHistories, setRateHistories] = useState<RateHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<RateItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RateItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'KAMAR' as RateItem['category'],
    user_type: 'Umum / Instansi',
    unit: 'PER_NIGHT' as RateItem['unit'],
    rate: 350000,
    effective_date: new Date().toISOString().split('T')[0],
    reason: '',
    description: '',
    is_active: true,
  });

  const loadData = () => {
    setRates(db.getRates());
    setRateHistories(db.getRateHistories());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (rate?: RateItem) => {
    if (rate) {
      setEditingRate(rate);
      setFormData({
        name: rate.name,
        category: rate.category,
        user_type: rate.user_type,
        unit: rate.unit,
        rate: rate.rate,
        effective_date: rate.effective_date || new Date().toISOString().split('T')[0],
        reason: '',
        description: rate.description || '',
        is_active: rate.is_active,
      });
    } else {
      setEditingRate(null);
      setFormData({
        name: '',
        category: 'KAMAR',
        user_type: 'Umum / Instansi',
        unit: 'PER_NIGHT',
        rate: 250000,
        effective_date: new Date().toISOString().split('T')[0],
        reason: 'Penambahan tarif baru',
        description: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Gagal', 'Nama tarif wajib diisi.');
      return;
    }

    if (editingRate && currentUser) {
      // Check if price changed
      if (Number(formData.rate) !== editingRate.rate) {
        db.updateRateWithHistory(
          editingRate.id,
          Number(formData.rate),
          formData.effective_date,
          formData.reason || 'Pembaruan tarif via formulir Master Tarif',
          currentUser
        );
      }
      
      // Update other attributes
      db.saveRate({
        id: editingRate.id,
        name: formData.name,
        category: formData.category,
        user_type: formData.user_type,
        unit: formData.unit,
        rate: Number(formData.rate),
        description: formData.description,
        is_active: formData.is_active,
        effective_date: formData.effective_date,
      }, currentUser);

      toast.success(
        'Tarif Berhasil Diperbarui',
        `Perubahan tarif ${formData.name} telah disimpan. Transaksi lama tetap menggunakan tarif saat reservasi dibuat.`
      );
    } else {
      db.saveRate({
        name: formData.name,
        category: formData.category,
        user_type: formData.user_type,
        unit: formData.unit,
        rate: Number(formData.rate),
        description: formData.description,
        is_active: formData.is_active,
        effective_date: formData.effective_date,
      }, currentUser || undefined);

      toast.success('Tarif Ditambahkan', `Tarif baru ${formData.name} berhasil disimpan.`);
    }

    setIsModalOpen(false);
    loadData();
  };

  const isHousekeeping = currentUser?.role === 'HOUSEKEEPING';

  const handleDeleteRate = () => {
    if (isHousekeeping) {
      toast.error('Akses Ditolak', 'Petugas Housekeeping tidak diizinkan menghapus data master tarif.');
      setDeleteTarget(null);
      return;
    }

    if (!deleteTarget) return;

    const res = db.deleteRate(deleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Tarif Dihapus', res.message);
      setDeleteTarget(null);
      loadData();
    } else {
      toast.error('Gagal Menghapus', res.message);
      setDeleteTarget(null);
    }
  };

  const filtered = rates.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#8a6d2b]" />
            Master Tarif Layanan & Akomodasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standar tarif sewa kamar, aula pertemuan, dan penggunaan fasilitas UPT Asrama Haji Papua.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsHistoryModalOpen(true)}
            icon={<History className="w-4 h-4 text-[#8a6d2b]" />}
          >
            Riwayat Perubahan Tarif ({rateHistories.length})
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenModal()}
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Tarif Baru
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama tarif, kategori, sasaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-white"
          >
            <option value="all">Semua Kategori</option>
            <option value="KAMAR">Kamar</option>
            <option value="FASILITAS">Fasilitas / Aula</option>
            <option value="LAYANAN">Layanan Tambahan</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Tarif</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Sasaran Pengguna</th>
                <th className="py-3 px-4">Satuan</th>
                <th className="py-3 px-4 text-right">Besaran Tarif (Rp)</th>
                <th className="py-3 px-4">Tanggal Efektif</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {item.name}
                    {item.description && (
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">{item.description}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {item.user_type}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {item.unit.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {formatDateIndo(item.effective_date)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.is_active ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8a6d2b] bg-[#fbf8ee] px-2 py-0.5 rounded-full border border-[#e8dfc8]">
                        <CheckCircle2 className="w-3 h-3" /> Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Non-Aktif
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#fbf8ee] hover:text-[#8a6d2b] transition-colors"
                        title="Edit Tarif"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {!isHousekeeping && (
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                          title="Hapus Tarif"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Tarif */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRate ? `Edit Tarif: ${editingRate.name}` : 'Tambah Tarif Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveRate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Tarif *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Sewa Kamar VIP Pejabat"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961]"
              >
                <option value="KAMAR">Kamar</option>
                <option value="FASILITAS">Fasilitas / Aula</option>
                <option value="LAYANAN">Layanan Tambahan</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Satuan Hitung *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961]"
              >
                <option value="PER_NIGHT">PER NIGHT (Per Malam - Penginapan)</option>
                <option value="PER_DAY">PER DAY (Per Hari - Aula & Ruang Pertemuan)</option>
                <option value="PER_ROOM">PER ROOM (Per Kamar)</option>
                <option value="PER_EVENT">PER EVENT (Per Acara)</option>
                <option value="PER_PERSON">PER PERSON (Per Orang)</option>
                <option value="PER_HOUR">PER HOUR (Per Jam)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Mulai Berlaku *</label>
              <input
                type="date"
                required
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Alasan Penyesuaian</label>
              <input
                type="text"
                placeholder="Contoh: SK Tarif Resmi Kemenhaj"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Perlindungan Transaksi Historis:</strong>
              Semua reservasi dan invoice terdahulu tetap menggunakan harga saat reservasi dibuat (<em>Price Snapshot</em>). Perubahan tarif hanya berlaku untuk pemesanan baru.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tarif (Rp) *</label>
              <input
                type="number"
                step="10000"
                min="0"
                required
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#8a6d2b] focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sasaran Pengguna</label>
              <input
                type="text"
                placeholder="Instansi / Jamaah / Umum"
                value={formData.user_type}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Keberlakuan</label>
            <select
              value={formData.is_active ? 'true' : 'false'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961]"
            >
              <option value="true">Aktif (Dapat Digunakan untuk Reservasi & Tagihan)</option>
              <option value="false">Non-Aktif (Diarsipkan)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi Tambahan</label>
            <input
              type="text"
              placeholder="Ketentuan pemakaian..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {editingRate ? 'Simpan Perubahan' : 'Simpan Tarif'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Rate History Log */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title="Riwayat Perubahan Tarif Resmi (Rate History)"
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Catatan kronologis perubahan standar tarif layanan, kamar, dan aula di lingkungan Asrama Haji Papua. Setiap transaksi historis terkunci menggunakan tarif saat reservasi diterbitkan.
          </p>

          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
            {rateHistories.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Belum ada riwayat perubahan tarif.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal Ubah</th>
                    <th className="py-2.5 px-3">Nama Tarif</th>
                    <th className="py-2.5 px-3">Tarif Lama ➔ Baru</th>
                    <th className="py-2.5 px-3">Mulai Berlaku</th>
                    <th className="py-2.5 px-3">Petugas</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rateHistories.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {formatDateTimeIndo(h.changed_at)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{h.rate_name}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className="text-slate-400 line-through mr-1">
                          {formatCurrency(h.previous_rate)}
                        </span>
                        ➔{' '}
                        <span className="font-bold text-[#8a6d2b]">
                          {formatCurrency(h.new_rate)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                        {formatDateIndo(h.effective_date)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{h.changed_by}</td>
                      <td className="py-2.5 px-3 text-slate-500 italic">{h.reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setIsHistoryModalOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteRate}
        title="Hapus Master Tarif"
        message={`Apakah Anda yakin ingin menghapus standar tarif "${deleteTarget?.name}"?`}
        confirmText="Hapus Tarif"
        variant="danger"
      />
    </div>
  );
};
