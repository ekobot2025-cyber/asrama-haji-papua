import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { db } from '../../db/database';
import { Room, Building, Floor, RoomType, RoomStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

export const RoomsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    room_number: '',
    building_id: '',
    floor_id: '',
    room_type_id: '',
    capacity: 4,
    rate_per_night: 350000,
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

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.room_number) return;

    db.saveRoom({
      room_number: formData.room_number,
      building_id: formData.building_id || buildings[0]?.id,
      floor_id: formData.floor_id || floors[0]?.id,
      room_type_id: formData.room_type_id || roomTypes[0]?.id,
      capacity: Number(formData.capacity),
      rate_per_night: Number(formData.rate_per_night),
      notes: formData.notes,
    });

    toast.success('Kamar Ditambahkan', `Kamar ${formData.room_number} beserta tempat tidur berhasil dibuat.`);
    setIsModalOpen(false);
    loadData();
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
            <BedDouble className="w-6 h-6 text-emerald-800" />
            Manajemen Data Kamar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data nomor kamar, tipe kamar, kapasitas tempat tidur, dan penetapan tarif dasar.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setFormData({
              room_number: '',
              building_id: buildings[0]?.id || '',
              floor_id: floors[0]?.id || '',
              room_type_id: roomTypes[0]?.id || '',
              capacity: 4,
              rate_per_night: 350000,
              notes: '',
            });
            setIsModalOpen(true);
          }}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Kamar Baru
        </Button>
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
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
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
                    {r.housekeeping_status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Kamar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Kamar Baru"
        maxWidth="md"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Kamar *</label>
              <input
                type="text"
                required
                placeholder="Contoh: A301 / B205"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold uppercase"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gedung *</label>
              <select
                value={formData.building_id}
                onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Kamar *</label>
              <select
                value={formData.room_type_id}
                onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kapasitas Bed *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tarif Sewa Per Malam (Rp) *</label>
            <input
              type="number"
              step="50000"
              required
              value={formData.rate_per_night}
              onChange={(e) => setFormData({ ...formData, rate_per_night: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan</label>
            <input
              type="text"
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
              Simpan Kamar & Generate Bed
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
