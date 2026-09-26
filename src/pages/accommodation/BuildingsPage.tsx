import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, CheckCircle2, AlertTriangle, Layers, BedDouble } from 'lucide-react';
import { db } from '../../db/database';
import { Building, Room } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const BuildingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    total_floors: 3,
    description: '',
    status: 'ACTIVE' as Building['status'],
  });

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Building | null>(null);

  const loadData = () => {
    setBuildings(db.getBuildings());
    setRooms(db.getRooms());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (bld?: Building) => {
    if (bld) {
      setEditingBuilding(bld);
      setFormData({
        code: bld.code,
        name: bld.name,
        total_floors: bld.total_floors,
        description: bld.description,
        status: bld.status,
      });
    } else {
      setEditingBuilding(null);
      setFormData({
        code: '',
        name: '',
        total_floors: 3,
        description: '',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error('Gagal', 'Kode dan nama gedung wajib diisi.');
      return;
    }

    db.saveBuilding({
      id: editingBuilding?.id,
      code: formData.code.toUpperCase(),
      name: formData.name,
      total_floors: Number(formData.total_floors),
      description: formData.description,
      status: formData.status,
    }, currentUser || undefined);

    toast.success(
      editingBuilding ? 'Gedung Diperbarui' : 'Gedung Ditambahkan',
      `${formData.name} berhasil disimpan ke sistem.`
    );
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteBuilding = () => {
    if (!deleteTarget) return;

    const res = db.deleteBuilding(deleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Gedung Dihapus', res.message);
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
            <Building2 className="w-6 h-6 text-emerald-800" />
            Master Gedung Asrama Haji
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data gedung akomodasi (Gedung Nabire, Jayapura, Merauke), zonasi, jumlah lantai, dan status operasional.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Gedung Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buildings.map((b) => {
          const bRooms = rooms.filter((r) => r.building_id === b.id);
          const totalBeds = bRooms.reduce((acc, r) => acc + r.capacity, 0);

          return (
            <div
              key={b.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    KODE: {b.code}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    b.status === 'ACTIVE' 
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                      : b.status === 'MAINTENANCE' 
                        ? 'text-amber-700 bg-amber-50 border border-amber-200' 
                        : 'text-slate-600 bg-slate-100'
                  }`}>
                    {b.status === 'ACTIVE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {b.status === 'MAINTENANCE' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {b.status === 'ACTIVE' ? 'Aktif' : b.status === 'MAINTENANCE' ? 'Pemeliharaan' : 'Non-Aktif'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{b.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[36px]">{b.description || 'Tidak ada catatan.'}</p>

                <div className="grid grid-cols-3 gap-2 mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Lantai</span>
                    <span className="font-extrabold text-slate-800 text-sm">{b.total_floors}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Kamar</span>
                    <span className="font-extrabold text-slate-800 text-sm">{bRooms.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Kapasitas</span>
                    <span className="font-extrabold text-emerald-800 text-sm">{totalBeds} Bed</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenModal(b)}
                  icon={<Edit className="w-3.5 h-3.5 text-slate-600" />}
                >
                  Edit Gedung
                </Button>
                <button
                  onClick={() => setDeleteTarget(b)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  title="Hapus Gedung"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tambah / Edit Gedung */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBuilding ? `Edit Data Gedung: ${editingBuilding.name}` : 'Tambah Gedung Akomodasi Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveBuilding} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Gedung *</label>
              <input
                type="text"
                required
                placeholder="GDD / GDE / GD-VIP"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl uppercase font-mono focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Lantai *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.total_floors}
                onChange={(e) => setFormData({ ...formData, total_floors: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Gedung *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Gedung Biak Numfor / Gedung Timika"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status Operasional Gedung</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700"
            >
              <option value="ACTIVE">Aktif (Siap Digunakan)</option>
              <option value="MAINTENANCE">Dalam Pemeliharaan / Renovasi</option>
              <option value="INACTIVE">Non-Aktif (Tutup Sementara)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi & Peruntukan</label>
            <textarea
              rows={3}
              placeholder="Contoh: Gedung akomodasi jamaah reguler dan peserta bimtek kedinasan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {editingBuilding ? 'Simpan Perubahan' : 'Simpan Gedung'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBuilding}
        title="Hapus Master Gedung"
        message={`Apakah Anda yakin ingin menghapus gedung "${deleteTarget?.name}" (${deleteTarget?.code})? Tindakan ini tidak dapat dibatalkan jika gedung belum memiliki kamar.`}
        confirmText="Hapus Gedung"
        variant="danger"
      />
    </div>
  );
};
