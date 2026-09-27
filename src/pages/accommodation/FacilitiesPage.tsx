import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Search, Users, MapPin, Edit, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { db } from '../../db/database';
import { Facility } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export const FacilitiesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const isHousekeeping = currentUser?.role === 'HOUSEKEEPING';

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'AULA' as Facility['type'],
    location: '',
    capacity: 100,
    daily_rate: 3500000,
    hourly_rate: 500000,
    status: 'AVAILABLE' as Facility['status'],
    description: '',
    amenities: 'Sound System Wireless, Proyektor LCD & Screen, Podium, AC Standing, Meja & Kursi',
  });

  const loadData = () => {
    setFacilities(db.getFacilities());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (fac?: Facility) => {
    if (isHousekeeping && !fac) {
      toast.error('Akses Dibatasi', 'Petugas Housekeeping hanya dapat memperbarui kondisi fasilitas yang sudah ada.');
      return;
    }

    if (fac) {
      setEditingFacility(fac);
      setFormData({
        name: fac.name,
        type: fac.type,
        location: fac.location,
        capacity: fac.capacity,
        daily_rate: fac.daily_rate,
        hourly_rate: fac.hourly_rate || 0,
        status: fac.status,
        description: fac.description,
        amenities: fac.amenities.join(', '),
      });
    } else {
      setEditingFacility(null);
      setFormData({
        name: '',
        type: 'AULA',
        location: 'Kompleks Asrama Haji Papua',
        capacity: 100,
        daily_rate: 3000000,
        hourly_rate: 400000,
        status: 'AVAILABLE',
        description: '',
        amenities: 'Sound System, Proyektor LCD, Kursi Futura, AC Central',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Gagal', 'Nama fasilitas wajib diisi.');
      return;
    }

    if (isHousekeeping && editingFacility) {
      db.saveFacility({
        id: editingFacility.id,
        name: editingFacility.name,
        type: editingFacility.type,
        location: editingFacility.location,
        capacity: editingFacility.capacity,
        daily_rate: editingFacility.daily_rate,
        hourly_rate: editingFacility.hourly_rate,
        status: formData.status,
        description: formData.description,
        amenities: editingFacility.amenities,
      }, currentUser || undefined);

      toast.success(
        'Kondisi Fasilitas Diperbarui',
        `Kesiapan & catatan kebersihan fasilitas ${editingFacility.name} berhasil disimpan.`
      );
      setIsModalOpen(false);
      loadData();
      return;
    }

    const amenitiesList = formData.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    db.saveFacility({
      id: editingFacility?.id,
      name: formData.name,
      type: formData.type,
      location: formData.location,
      capacity: Number(formData.capacity),
      daily_rate: Number(formData.daily_rate),
      hourly_rate: Number(formData.hourly_rate) || undefined,
      status: formData.status,
      description: formData.description,
      amenities: amenitiesList,
    }, currentUser || undefined);

    toast.success(
      editingFacility ? 'Fasilitas Diperbarui' : 'Fasilitas Ditambahkan',
      `Fasilitas ${formData.name} berhasil disimpan.`
    );
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteFacility = () => {
    if (isHousekeeping) {
      toast.error('Akses Ditolak', 'Petugas Housekeeping tidak diizinkan menghapus data master fasilitas.');
      setDeleteTarget(null);
      return;
    }

    if (!deleteTarget) return;

    const res = db.deleteFacility(deleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Fasilitas Dihapus', res.message);
      setDeleteTarget(null);
      loadData();
    } else {
      toast.error('Gagal Menghapus', res.message);
      setDeleteTarget(null);
    }
  };

  const filtered = facilities.filter((f) => {
    return (
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#8a6d2b]" />
            Fasilitas Umum & Ruang Pertemuan (Aula)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aula Utama Cenderawasih, Ruang Pertemuan Asmat, Masjid Baiturrahim, Lapangan Manasik Haji, dan Dapur Umum.
          </p>
        </div>

        {isHousekeeping ? (
          <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Housekeeping: Mode Kondisi Fasilitas</span>
          </div>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenModal()}
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Fasilitas Baru
          </Button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari fasilitas, aula, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((fac) => (
          <div
            key={fac.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a6d2b] bg-[#fbf8ee] px-2.5 py-0.5 rounded-full border border-[#e8dfc8]">
                  {fac.type.replace(/_/g, ' ')}
                </span>
                <Badge status={fac.status} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">{fac.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {fac.location}
              </p>

              <p className="text-xs text-slate-600 leading-relaxed mb-4 min-h-[36px]">{fac.description}</p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Kapasitas</span>
                  <span className="font-bold text-slate-800">{fac.capacity} Orang</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tarif Harian</span>
                  <span className="font-mono font-black text-[#8a6d2b] text-sm">
                    {fac.daily_rate > 0 ? formatCurrency(fac.daily_rate) : 'Gratis'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Fasilitas & Kelengkapan:
                </span>
                <div className="flex flex-wrap gap-1">
                  {fac.amenities.map((item, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenModal(fac)}
                icon={<Edit className="w-3.5 h-3.5 text-slate-600" />}
              >
                {isHousekeeping ? 'Update Kondisi Fasilitas' : 'Edit Fasilitas'}
              </Button>
              {!isHousekeeping && (
                <button
                  onClick={() => setDeleteTarget(fac)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  title="Hapus Fasilitas"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Fasilitas */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isHousekeeping
            ? `Pembaruan Kondisi & Kebersihan Fasilitas: ${editingFacility?.name}`
            : editingFacility
              ? `Edit Fasilitas: ${editingFacility.name}`
              : 'Tambah Fasilitas & Aula Baru'
        }
        maxWidth="md"
      >
        <form onSubmit={handleSaveFacility} className="space-y-4 text-xs">
          {isHousekeeping && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Mode Housekeeping: Pembaruan Kondisi & Kesiapan Fasilitas</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Data master, spesifikasi aula, dan tarif sewa dikunci oleh sistem. Anda hanya berwenang memperbarui status ketersediaan dan catatan kebersihan/kondisi fasilitas.
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Fasilitas / Aula {isHousekeeping && <span className="text-[10px] text-slate-400 font-normal">(Terkunci)</span>} *
            </label>
            <input
              type="text"
              required
              readOnly={isHousekeeping}
              placeholder="Contoh: Aula Utama Cenderawasih"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] ${
                isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jenis Fasilitas {isHousekeeping && <span className="text-[10px] text-slate-400 font-normal">(Terkunci)</span>} *
              </label>
              <select
                value={formData.type}
                disabled={isHousekeeping}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Facility['type'] })}
                className={`w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961] ${
                  isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-90' : ''
                }`}
              >
                <option value="AULA">Aula Pertemuan / Serbaguna</option>
                <option value="RUANG_RAPAT">Ruang Rapat / VIP Meeting</option>
                <option value="RUANG_KELAS">Ruang Kelas / Pelatihan</option>
                <option value="MASJID">Masjid / Musholla</option>
                <option value="RUANG_MAKAN">Ruang Makan / Dining Hall</option>
                <option value="LAPANGAN_MANASIK">Lapangan Manasik Haji</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kapasitas (Orang) {isHousekeeping && <span className="text-[10px] text-slate-400 font-normal">(Terkunci)</span>} *
              </label>
              <input
                type="number"
                min="1"
                required
                readOnly={isHousekeeping}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                className={`w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] ${
                  isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Lokasi Gedung / Posisi {isHousekeeping && <span className="text-[10px] text-slate-400 font-normal">(Terkunci)</span>}
              </label>
              <input
                type="text"
                readOnly={isHousekeeping}
                placeholder="Gedung Utama Lt. 1 / Samping Masjid"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] ${
                  isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Kesiapan & Ketersediaan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Facility['status'] })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961] font-medium"
              >
                <option value="AVAILABLE">AVAILABLE (Tersedia & Bersih)</option>
                <option value="OCCUPIED">OCCUPIED (Sedang Digunakan)</option>
                <option value="MAINTENANCE">MAINTENANCE (Pemeliharaan / Perbaikan)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tarif Sewa Harian (Rp) {isHousekeeping && <span className="text-[10px] text-slate-400 font-normal">(Terkunci)</span>} *
              </label>
              <input
                type="number"
                step="50000"
                required
                readOnly={isHousekeeping}
                value={formData.daily_rate}
                onChange={(e) => setFormData({ ...formData, daily_rate: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#8a6d2b] focus:ring-2 focus:ring-[#c9a961] ${
                  isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tarif Per Jam {isHousekeeping && <span className="text-[10px] text-slate-400 font-normal">(Terkunci)</span>}
              </label>
              <input
                type="number"
                step="50000"
                readOnly={isHousekeeping}
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] ${
                  isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isHousekeeping ? 'Catatan Kebersihan & Kondisi Fasilitas' : 'Deskripsi Singkat'}
            </label>
            <textarea
              rows={2}
              placeholder="Deskripsikan kondisi kebersihan, kesiapan sound, AC, dan perlengkapan aula..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Kelengkapan & Fasilitas {isHousekeeping && <span className="text-[10px] text-slate-400 font-normal">(Terkunci)</span>}
            </label>
            <input
              type="text"
              readOnly={isHousekeeping}
              placeholder="Sound System Wireless, Proyektor LCD, AC Standing, Meja & Kursi"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              className={`w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] ${
                isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {isHousekeeping ? 'Simpan Kondisi Fasilitas' : editingFacility ? 'Simpan Perubahan' : 'Simpan Fasilitas'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteFacility}
        title="Hapus Master Fasilitas"
        message={`Apakah Anda yakin ingin menghapus fasilitas "${deleteTarget?.name}"? Tindakan ini akan menghapus data fasilitas dari katalog sistem.`}
        confirmText="Hapus Fasilitas"
        variant="danger"
      />
    </div>
  );
};
