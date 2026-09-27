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
  const isHousekeeping = currentUser?.role === 'HOUSEKEEPING';

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
    if (isHousekeeping && !bed) {
      toast.error('Akses Dibatasi', 'Petugas Housekeeping hanya dapat memperbarui kondisi tempat tidur yang sudah ada.');
      return;
    }

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

    if (isHousekeeping && editingBed) {
      db.saveBed({
        id: editingBed.id,
        bed_code: editingBed.bed_code,
        room_id: editingBed.room_id,
        status: formData.status,
        notes: formData.notes,
      }, currentUser || undefined);

      toast.success(
        'Kondisi Bed Diperbarui',
        `Kondisi fisik dan kebersihan bed ${editingBed.bed_code} berhasil disimpan.`
      );
      setIsModalOpen(false);
      loadData();
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
    if (isHousekeeping) {
      toast.error('Akses Ditolak', 'Petugas Housekeeping tidak diizinkan menghapus data master tempat tidur.');
      setDeleteTarget(null);
      return;
    }

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
            <Layers className="w-6 h-6 text-[#8a6d2b]" />
            Manajemen Tempat Tidur Individual (Bed)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Asrama Haji berbasis kapasitas tempat tidur individual per kamar (M101-B01, M101-B02, dst).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#fbf8ee] px-3 py-1.5 rounded-xl border border-[#e8dfc8] text-xs font-bold text-[#8a6d2b]">
            Total Terdaftar: {beds.length} Bed
          </div>
          {isHousekeeping ? (
            <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Housekeeping: Mode Kondisi Bed</span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => handleOpenModal()}
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah Bed
            </Button>
          )}
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
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-white"
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
            className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#c9a961] transition-colors group"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-slate-900">{b.bed_code}</span>
                <span className={`w-2 h-2 rounded-full ${
                  b.status === 'AVAILABLE' ? 'bg-[#fbf8ee]0' :
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
                  className="p-1 rounded text-slate-500 hover:text-[#8a6d2b] hover:bg-[#fbf8ee] transition-colors"
                  title={isHousekeeping ? "Update Kondisi & Kebersihan Bed" : "Edit Status Bed"}
                >
                  <Edit className="w-3 h-3" />
                </button>
                {!isHousekeeping && (
                  <button
                    onClick={() => setDeleteTarget(b)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Bed"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Bed */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          isHousekeeping
            ? `Pembaruan Kondisi Bed: ${editingBed?.bed_code}`
            : editingBed
              ? `Edit Tempat Tidur: ${editingBed.bed_code}`
              : 'Tambah Tempat Tidur Baru'
        }
        maxWidth="md"
      >
        <form onSubmit={handleSaveBed} className="space-y-4 text-xs">
          {isHousekeeping && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Mode Housekeeping: Pembaruan Kondisi & Kebersihan</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  Penempatan kamar dan kode bed dikunci oleh sistem. Anda hanya berwenang memperbarui status kelayakan/kebersihan bed dan catatan kondisi fisik (kasur, sprei, bantal).
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Kamar {isHousekeeping && <span className="text-[10px] text-slate-400 font-normal">(Terkunci)</span>} *
            </label>
            <select
              value={formData.room_id}
              disabled={isHousekeeping}
              onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
              className={`w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961] ${
                isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed opacity-90' : ''
              }`}
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
              <label className="block font-bold text-slate-700 mb-1">
                Kode Bed {isHousekeeping && <span className="text-[10px] text-slate-400 font-normal">(Terkunci)</span>} *
              </label>
              <input
                type="text"
                required
                readOnly={isHousekeeping}
                placeholder="M101-B01"
                value={formData.bed_code}
                onChange={(e) => setFormData({ ...formData, bed_code: e.target.value })}
                className={`w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase font-bold focus:ring-2 focus:ring-[#c9a961] ${
                  isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Status Tempat Tidur</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BedStatus })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961] font-medium"
              >
                <option value="AVAILABLE">AVAILABLE (Kosong & Bersih)</option>
                <option value="RESERVED">RESERVED (Telah Dipesan)</option>
                <option value="OCCUPIED">OCCUPIED (Sedang Dihuni)</option>
                <option value="MAINTENANCE">MAINTENANCE (Rusak / Perbaikan)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Catatan Kondisi Fisik & Kebersihan Bed
            </label>
            <input
              type="text"
              placeholder="Contoh: Tempat tidur bawah dekat jendela, sprei baru diganti, kondisi kasur baik"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {isHousekeeping
                ? 'Simpan Kondisi Bed'
                : editingBed
                  ? 'Simpan Perubahan Bed'
                  : 'Simpan Bed'}
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
