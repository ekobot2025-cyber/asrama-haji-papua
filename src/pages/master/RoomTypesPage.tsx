import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Edit, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { db } from '../../db/database';
import { RoomType } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export const RoomTypesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [types, setTypes] = useState<RoomType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoomType | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    default_capacity: 4,
    base_rate_per_night: 350000,
    description: '',
    amenities: 'AC, Kamar Mandi Dalam, Air Panas, Sajadah & Arah Kiblat',
  });

  const loadData = () => {
    setTypes(db.getRoomTypes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (rType?: RoomType) => {
    if (rType) {
      setEditingType(rType);
      setFormData({
        code: rType.code,
        name: rType.name,
        default_capacity: rType.default_capacity,
        base_rate_per_night: rType.base_rate_per_night,
        description: rType.description,
        amenities: rType.amenities.join(', '),
      });
    } else {
      setEditingType(null);
      setFormData({
        code: '',
        name: '',
        default_capacity: 4,
        base_rate_per_night: 350000,
        description: '',
        amenities: 'AC, Kamar Mandi Dalam, Air Panas, Lemari Pakaian, Sajadah & Arah Kiblat',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error('Gagal', 'Kode dan nama jenis kamar wajib diisi.');
      return;
    }

    const amenitiesList = formData.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    db.saveRoomType({
      id: editingType?.id,
      code: formData.code.toUpperCase(),
      name: formData.name,
      default_capacity: Number(formData.default_capacity),
      base_rate_per_night: Number(formData.base_rate_per_night),
      description: formData.description,
      amenities: amenitiesList,
    }, currentUser || undefined);

    toast.success(
      editingType ? 'Tipe Kamar Diperbarui' : 'Tipe Kamar Ditambahkan',
      `Jenis kamar ${formData.name} berhasil disimpan.`
    );
    setIsModalOpen(false);
    loadData();
  };

  const isHousekeeping = currentUser?.role === 'HOUSEKEEPING';

  const handleDeleteType = () => {
    if (isHousekeeping) {
      toast.error('Akses Ditolak', 'Petugas Housekeeping tidak diizinkan menghapus data jenis kamar.');
      setDeleteTarget(null);
      return;
    }

    if (!deleteTarget) return;

    const res = db.deleteRoomType(deleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Tipe Kamar Dihapus', res.message);
      setDeleteTarget(null);
      loadData();
    } else {
      toast.error('Tidak Dapat Dihapus', res.message);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-emerald-800" />
            Master Jenis Kamar (Room Types)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kategori tipe kamar: Standard Quad (4 Bed), VIP Twin (2 Bed), Rombongan (6 Bed), dan VIP Suite.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Tipe Kamar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {types.map((t) => (
          <div
            key={t.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {t.code}
                </span>
                <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Kapasitas: {t.default_capacity} Bed
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{t.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 min-h-[32px]">{t.description}</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs mb-4">
                <span className="text-slate-500 font-medium">Tarif Standar Acuan:</span>
                <span className="font-black font-mono text-emerald-900 text-sm">
                  {formatCurrency(t.base_rate_per_night)} / malam
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Fasilitas Bawaan:
                </span>
                <div className="flex flex-wrap gap-1">
                  {t.amenities.map((item, idx) => (
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
                onClick={() => handleOpenModal(t)}
                icon={<Edit className="w-3.5 h-3.5 text-slate-600" />}
              >
                Edit Jenis Kamar
              </Button>
              {!isHousekeeping && (
                <button
                  onClick={() => setDeleteTarget(t)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  title="Hapus Jenis Kamar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Tipe Kamar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingType ? `Edit Jenis Kamar: ${editingType.name}` : 'Tambah Jenis Kamar Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveType} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Jenis Kamar *</label>
              <input
                type="text"
                required
                placeholder="STD-QUAD / VIP-TWIN"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl uppercase font-mono focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kapasitas Standar (Bed) *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.default_capacity}
                onChange={(e) => setFormData({ ...formData, default_capacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Jenis Kamar *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kamar Standard 4 Bed (Quad)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tarif Acuan Per Malam (Rp) *</label>
            <input
              type="number"
              step="10000"
              required
              value={formData.base_rate_per_night}
              onChange={(e) => setFormData({ ...formData, base_rate_per_night: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi & Standar Fasilitas</label>
            <textarea
              rows={2}
              placeholder="Jelaskan spesifikasi kamar, ukuran tempat tidur (bed), peruntukan jamaah/tamu..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Fasilitas Kamar (Pisahkan dengan koma)</label>
            <input
              type="text"
              placeholder="AC, Kamar Mandi Dalam, Air Panas, Lemari Pakaian, Sajadah & Arah Kiblat"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {editingType ? 'Simpan Perubahan' : 'Simpan Tipe Kamar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteType}
        title="Hapus Master Jenis Kamar"
        message={`Apakah Anda yakin ingin menghapus tipe kamar "${deleteTarget?.name}"? Tipe kamar yang masih digunakan oleh kamar aktif tidak dapat dihapus.`}
        confirmText="Hapus Tipe Kamar"
        variant="danger"
      />
    </div>
  );
};
