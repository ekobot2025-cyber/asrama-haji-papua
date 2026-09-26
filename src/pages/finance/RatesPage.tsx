import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../../db/database';
import { RateItem } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo } from '../../utils/formatters';

export const RatesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [rates, setRates] = useState<RateItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'KAMAR' as const,
    user_type: 'Umum / Instansi',
    unit: 'PER_ROOM' as const,
    rate: 350000,
    description: '',
  });

  const loadData = () => {
    setRates(db.getRates());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newRate: RateItem = {
      id: `rate-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      user_type: formData.user_type,
      unit: formData.unit,
      rate: Number(formData.rate),
      description: formData.description,
      is_active: true,
      effective_date: new Date().toISOString().split('T')[0],
    };

    const currentRates = db.getRates();
    currentRates.unshift(newRate);
    localStorage.setItem('sipah_rates', JSON.stringify(currentRates));

    toast.success('Tarif Ditambahkan', `Tarif ${newRate.name} berhasil disimpan.`);
    setIsModalOpen(false);
    loadData();
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
            <Receipt className="w-6 h-6 text-emerald-800" />
            Master Tarif Layanan & Akomodasi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standar tarif sewa kamar, aula pertemuan, dan penggunaan fasilitas UPT Asrama Haji Papua.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Tarif Baru
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama tarif, kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Aktif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Tarif */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Tarif Baru"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Tarif *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Sewa Kamar VIP Pejabat"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
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
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="PER_ROOM">PER ROOM (Per Kamar/Malam)</option>
                <option value="PER_PERSON">PER PERSON (Per Orang)</option>
                <option value="PER_EVENT">PER EVENT (Per Acara/Hari)</option>
                <option value="PER_HOUR">PER HOUR (Per Jam)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tarif (Rp) *</label>
              <input
                type="number"
                step="50000"
                min="0"
                required
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Sasaran Pengguna</label>
              <input
                type="text"
                placeholder="Instansi / Jamaah / Umum"
                value={formData.user_type}
                onChange={(e) => setFormData({ ...formData, user_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi Tambahan</label>
            <input
              type="text"
              placeholder="Ketentuan pemakaian..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Tarif
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
