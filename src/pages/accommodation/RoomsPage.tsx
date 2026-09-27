import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Search, Filter, Edit, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { db } from '../../db/database';
import { Room, Building, Floor, RoomType, RoomStatus, HousekeepingStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export const RoomsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();
  const isHousekeeping = currentUser?.role === 'HOUSEKEEPING';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  const [formData, setFormData] = useState({
    room_number: '',
    building_id: '',
    floor_id: '',
    room_type_id: '',
    capacity: 4,
    rate_per_night: 350000,
    status: 'AVAILABLE' as RoomStatus,
    housekeeping_status: 'READY' as HousekeepingStatus,
    notes: '',
  });

  const loadData = () => {
    setRooms(db.getRooms());
    setBuildings(db.getBuildings());
    setFloors(db.getFloors());
    setRoomTypes(db.getRoomTypes());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (room?: Room) => {
    if (isHousekeeping && !room) {
      toast.error('Akses Ditolak', 'Petugas Housekeeping hanya dapat memperbarui kondisi kamar yang sudah ada.');
      return;
    }

    if (room) {
      setEditingRoom(room);
      setFormData({
        room_number: room.room_number,
        building_id: room.building_id,
        floor_id: room.floor_id,
        room_type_id: room.room_type_id,
        capacity: room.capacity,
        rate_per_night: room.rate_per_night,
        status: room.status,
        housekeeping_status: room.housekeeping_status,
        notes: room.notes || '',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        room_number: '',
        building_id: buildings[0]?.id || '',
        floor_id: floors[0]?.id || '',
        room_type_id: roomTypes[0]?.id || '',
        capacity: 4,
        rate_per_night: 350000,
        status: 'AVAILABLE',
        housekeeping_status: 'READY',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room_number) {
      toast.error('Gagal', 'Nomor kamar wajib diisi.');
      return;
    }

    if (isHousekeeping && editingRoom) {
      // Housekeeping only updates conditions, housekeeping status, and notes
      db.saveRoom({
        id: editingRoom.id,
        room_number: editingRoom.room_number,
        building_id: editingRoom.building_id,
        floor_id: editingRoom.floor_id,
        room_type_id: editingRoom.room_type_id,
        capacity: editingRoom.capacity,
        rate_per_night: editingRoom.rate_per_night,
        status: formData.status,
        housekeeping_status: formData.housekeeping_status,
        notes: formData.notes,
      }, currentUser || undefined);

      toast.success(
        'Kondisi Kamar Diperbarui',
        `Status dan catatan kebersihan kamar ${editingRoom.room_number} berhasil diperbarui.`
      );
      setIsModalOpen(false);
      loadData();
      return;
    }

    db.saveRoom({
      id: editingRoom?.id,
      room_number: formData.room_number.toUpperCase(),
      building_id: formData.building_id || buildings[0]?.id,
      floor_id: formData.floor_id || floors[0]?.id,
      room_type_id: formData.room_type_id || roomTypes[0]?.id,
      capacity: Number(formData.capacity),
      rate_per_night: Number(formData.rate_per_night),
      status: formData.status,
      housekeeping_status: formData.housekeeping_status,
      notes: formData.notes,
    }, currentUser || undefined);

    toast.success(
      editingRoom ? 'Kamar Diperbarui' : 'Kamar Ditambahkan',
      `Kamar ${formData.room_number} beserta tempat tidur berhasil disimpan.`
    );
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteRoom = () => {
    if (isHousekeeping) {
      toast.error('Akses Ditolak', 'Petugas Housekeeping tidak diizinkan menghapus data master kamar.');
      setDeleteTarget(null);
      return;
    }
    if (!deleteTarget) return;

    const res = db.deleteRoom(deleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Kamar Dihapus', res.message);
      setDeleteTarget(null);
      loadData();
    } else {
      toast.error('Gagal Menghapus', res.message);
      setDeleteTarget(null);
    }
  };

  const getBuildingName = (id: string) => buildings.find((b) => b.id === id)?.name || '-';
  const getRoomTypeName = (id: string) => roomTypes.find((t) => t.id === id)?.name || '-';

  const filtered = rooms.filter((r) => {
    const matchSearch = r.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBld = buildingFilter === 'all' || r.building_id === buildingFilter;
    return matchSearch && matchBld;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-[#8a6d2b]" />
            Manajemen Data Kamar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data nomor kamar, tipe kamar, kapasitas tempat tidur, penetapan tarif dasar, dan kontrol status kamar.
          </p>
        </div>

        {!isHousekeeping ? (
          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenModal()}
            icon={<Plus className="w-4 h-4" />}
          >
            Tambah Kamar Baru
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Mode Housekeeping: Pembaruan Status & Kondisi</span>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor kamar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-white"
          >
            <option value="all">Semua Gedung</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Kamar</th>
                <th className="py-3 px-4">Gedung</th>
                <th className="py-3 px-4">Jenis Kamar</th>
                <th className="py-3 px-4 text-center">Kapasitas Bed</th>
                <th className="py-3 px-4 text-right">Tarif Dasar / Malam</th>
                <th className="py-3 px-4 text-center">Status Kamar</th>
                <th className="py-3 px-4 text-center">Kebersihan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-black text-slate-900 text-sm">
                    {r.room_number}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {getBuildingName(r.building_id)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {getRoomTypeName(r.room_type_id)}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {r.capacity} Bed
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrency(r.rate_per_night)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge status={r.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-600">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      r.housekeeping_status === 'READY' ? 'bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8]' :
                      r.housekeeping_status === 'DIRTY' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                      r.housekeeping_status === 'IN_CLEANING' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                      'bg-purple-50 text-purple-800 border border-purple-200'
                    }`}>
                      {r.housekeeping_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenModal(r)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#fbf8ee] hover:text-[#8a6d2b] transition-colors"
                        title={isHousekeeping ? "Update Kondisi & Kebersihan Kamar" : "Edit Data Kamar"}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {!isHousekeeping && (
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                          title="Hapus Kamar"
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

      {/* Modal Tambah / Edit Kamar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isHousekeeping ? `Update Status & Kebersihan Kamar: ${editingRoom?.room_number}` : editingRoom ? `Edit Data Kamar: ${editingRoom.room_number}` : 'Tambah Kamar Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
          {isHousekeeping && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Mode Petugas Housekeeping</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Data master kamar (nomor, gedung, jenis, kapasitas, tarif) bersifat terkunci. Anda hanya berwenang memperbarui <strong>Status Kamar</strong>, <strong>Status Kebersihan</strong>, dan <strong>Catatan Kondisi Fisik</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor Kamar {isHousekeeping && <span className="text-slate-400 font-normal">(Terkunci)</span>}
              </label>
              <input
                type="text"
                required
                disabled={isHousekeeping}
                placeholder="Contoh: A301 / B205"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl font-bold uppercase ${
                  isHousekeeping 
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                    : 'border-slate-200 focus:ring-2 focus:ring-[#c9a961]'
                }`}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Gedung {isHousekeeping && <span className="text-slate-400 font-normal">(Terkunci)</span>}
              </label>
              <select
                disabled={isHousekeeping}
                value={formData.building_id}
                onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl ${
                  isHousekeeping 
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                    : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#c9a961]'
                }`}
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jenis Kamar {isHousekeeping && <span className="text-slate-400 font-normal">(Terkunci)</span>}
              </label>
              <select
                disabled={isHousekeeping}
                value={formData.room_type_id}
                onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl ${
                  isHousekeeping 
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                    : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#c9a961]'
                }`}
              >
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kapasitas Bed {isHousekeeping && <span className="text-slate-400 font-normal">(Terkunci)</span>}
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                disabled={isHousekeeping}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                className={`w-full px-3 py-2 border rounded-xl ${
                  isHousekeeping 
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                    : 'border-slate-200 focus:ring-2 focus:ring-[#c9a961]'
                }`}
              />
              {!isHousekeeping && (
                <span className="text-[10px] text-slate-400 mt-0.5 block">Tempat tidur akan disinkronkan otomatis</span>
              )}
            </div>
          </div>

          {/* Status & Kebersihan (Bisa diedit oleh Housekeeping) */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#fbf8ee] rounded-xl border border-[#e8dfc8]">
            <div>
              <label className="block font-bold text-[#1A1410] mb-1">
                Status Kamar <span className="text-[#8a6d2b] text-[10px]">(Dapat Diedit)</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                className="w-full px-3 py-2 border border-[#c9a961] rounded-xl bg-white font-bold text-slate-900 focus:ring-2 focus:ring-[#c9a961]"
              >
                <option value="AVAILABLE">AVAILABLE (Tersedia)</option>
                <option value="RESERVED">RESERVED (Dipesan)</option>
                <option value="OCCUPIED">OCCUPIED (Terisi Tamu)</option>
                <option value="CLEANING">CLEANING (Sedang Dibersihkan)</option>
                <option value="MAINTENANCE">MAINTENANCE (Perbaikan)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#1A1410] mb-1">
                Status Housekeeping <span className="text-[#8a6d2b] text-[10px]">(Dapat Diedit)</span>
              </label>
              <select
                value={formData.housekeeping_status}
                onChange={(e) => setFormData({ ...formData, housekeeping_status: e.target.value as HousekeepingStatus })}
                className="w-full px-3 py-2 border border-[#c9a961] rounded-xl bg-white font-bold text-slate-900 focus:ring-2 focus:ring-[#c9a961]"
              >
                <option value="READY">READY (Bersih & Siap Huni)</option>
                <option value="INSPECTED">INSPECTED (Telah Diinspeksi)</option>
                <option value="IN_CLEANING">IN_CLEANING (Proses Pembersihan)</option>
                <option value="DIRTY">DIRTY (Kotor Pasca Checkout)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tarif Sewa Per Malam (Rp) {isHousekeeping && <span className="text-slate-400 font-normal">(Terkunci)</span>}
            </label>
            <input
              type="number"
              step="10000"
              required
              disabled={isHousekeeping}
              value={formData.rate_per_night}
              onChange={(e) => setFormData({ ...formData, rate_per_night: parseInt(e.target.value) || 0 })}
              className={`w-full px-3 py-2 border rounded-xl font-bold ${
                isHousekeeping 
                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                  : 'text-[#8a6d2b] border-slate-200 focus:ring-2 focus:ring-[#c9a961]'
              }`}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Catatan Kondisi / Kebersihan Kamar <span className="text-[#8a6d2b] text-[10px]">(Dapat Diedit)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: AC berfungsi dingin, sprei baru diganti, handuk lengkap"
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
              {isHousekeeping ? 'Simpan Kondisi & Status Kamar' : editingRoom ? 'Simpan Perubahan Kamar' : 'Simpan Kamar & Generate Bed'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteRoom}
        title="Hapus Master Kamar"
        message={`Apakah Anda yakin ingin menghapus kamar "${deleteTarget?.room_number}"? Semua tempat tidur (${deleteTarget?.capacity} bed) terkait kamar ini juga akan dihapus. Kamar yang sedang dihuni tidak dapat dihapus.`}
        confirmText="Hapus Kamar"
        variant="danger"
      />
    </div>
  );
};
