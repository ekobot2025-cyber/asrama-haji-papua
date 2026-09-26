import React, { useState, useEffect } from 'react';
import { Layers, Search, Filter, BedDouble, Plus, Edit, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { db } from '../../db/database';
import { Bed, Room, BedStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const BedsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [beds, setBeds] = useState<Bed[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Bed | null>(null);

  const [formData, setFormData] = useState({
    bed_code: '',
    room_id: '',
    status: 'AVAILABLE' as BedStatus,
    notes: '',
  });

  const loadData = () => {
    setBeds(db.getBeds());
    setRooms(db.getRooms());
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRoomNumber = (roomId: string) => rooms.find((r) => r.id === roomId)?.room_number || '-';

  const handleOpenModal = (bed?: Bed) => {
    if (bed) {
      setEditingBed(bed);
      setFormData({
        bed_code: bed.bed_code,
        room_id: bed.room_id,
        status: bed.status,
        notes: bed.notes || '',
      });
    } else {
      setEditingBed(null);
      const defaultRoom = rooms[0];
      const roomBeds = beds.filter(b => b.room_id === defaultRoom?.id);
      const nextBedNum = String(roomBeds.length + 1).padStart(2, '0');
      setFormData({
        bed_code: defaultRoom ? `${defaultRoom.room_number}-B${nextBedNum}` : 'BED-01',
        room_id: defaultRoom?.id || '',
        status: 'AVAILABLE',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bed_code || !formData.room_id) {
      toast.error('Gagal', 'Kode tempat tidur dan kamar wajib diisi.');
      return;
    }

    db.saveBed({
      id: editingBed?.id,
      bed_code: formData.bed_code.toUpperCase(),
      room_id: formData.room_id,
      status: formData.status,
      notes: formData.notes,
    }, currentUser || undefined);

    toast.success(
      editingBed ? 'Tempat Tidur Diperbarui' : 'Tempat Tidur Ditambahkan',
      `Bed ${formData.bed_code} berhasil disimpan.`
    );
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteBed = () => {
    if (!deleteTarget) return;

    const res = db.deleteBed(deleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Tempat Tidur Dihapus', res.message);
      setDeleteTarget(null);
      loadData();
    } else {
      toast.error('Gagal Menghapus', res.message);
      setDeleteTarget(null);
    }
  };

  const filtered = beds.filter((b) => {
    const matchSearch =
      b.bed_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRoomNumber(b.room_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-800" />
            Manajemen Tempat Tidur Individual (Bed)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Asrama Haji berbasis kapasitas tempat tidur individual per kamar (A101-B01, A101-B02, dst).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
            Total Terdaftar: {beds.length} Bed
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenModal()}
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Bed
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode bed, nomor kamar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="all">Semua Status Bed</option>
            <option value="AVAILABLE">AVAILABLE (Kosong)</option>
            <option value="OCCUPIED">OCCUPIED (Terisi)</option>
            <option value="RESERVED">RESERVED (Dipesan)</option>
            <option value="MAINTENANCE">MAINTENANCE (Rusak)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-slate-900">{b.bed_code}</span>
                <span className={`w-2 h-2 rounded-full ${
                  b.status === 'AVAILABLE' ? 'bg-emerald-500' :
                  b.status === 'OCCUPIED' ? 'bg-blue-600' :
                  b.status === 'RESERVED' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
              </div>
              <p className="text-[11px] text-slate-500">Kamar {getRoomNumber(b.room_id)}</p>
              {b.notes && (
                <p className="text-[10px] text-slate-400 mt-1 truncate" title={b.notes}>{b.notes}</p>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <Badge status={b.status} size="sm" showDot={false} />
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(b)}
                  className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title="Edit Status Bed"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setDeleteTarget(b)}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hapus Bed"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Bed */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBed ? `Edit Tempat Tidur: ${editingBed.bed_code}` : 'Tambah Tempat Tidur Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveBed} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kamar *</label>
            <select
              value={formData.room_id}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Kamar {r.room_number} (Kapasitas: {r.capacity} Bed)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Bed *</label>
              <input
                type="text"
                required
                placeholder="A101-B01"
                value={formData.bed_code}
                onChange={(e) => setFormData({ ...formData, bed_code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Tempat Tidur</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BedStatus })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700"
              >
                <option value="AVAILABLE">AVAILABLE (Kosong & Bersih)</option>
                <option value="RESERVED">RESERVED (Telah Dipesan)</option>
                <option value="OCCUPIED">OCCUPIED (Sedang Dihuni)</option>
                <option value="MAINTENANCE">MAINTENANCE (Rusak / Perbaikan)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tempat Tidur</label>
            <input
              type="text"
              placeholder="Contoh: Ranjang bawah dekat jendela / dekat pintu"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {editingBed ? 'Simpan Perubahan Bed' : 'Simpan Bed'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBed}
        title="Hapus Tempat Tidur"
        message={`Apakah Anda yakin ingin menghapus tempat tidur "${deleteTarget?.bed_code}"? Tempat tidur yang sedang terisi atau dipesan tidak dapat dihapus.`}
        confirmText="Hapus Bed"
        variant="danger"
      />
    </div>
  );
};
