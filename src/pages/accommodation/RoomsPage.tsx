import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Search, Filter, Edit, Trash2, CheckCircle2, AlertTriangle, Layers, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'ROOMS' | 'ROOM_TYPES'>('ROOMS');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');

  // Physical Room Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  const [formData, setFormData] = useState({
    room_number: '',
    building_id: '',
    floor_id: '',
    room_type_id: '',
    capacity: 2,
    rate_per_night: 250000,
    status: 'AVAILABLE' as RoomStatus,
    housekeeping_status: 'READY' as HousekeepingStatus,
    notes: '',
    image_url: '',
  });

  // Room Type Modal State
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [typeDeleteTarget, setTypeDeleteTarget] = useState<RoomType | null>(null);

  const [typeFormData, setTypeFormData] = useState({
    name: '',
    code: '',
    category: 'PENGINAPAN' as const,
    rate_unit: 'PER_NIGHT' as const,
    base_rate: 250000,
    capacity: 2,
    amenities: 'AC, Meja, Lemari, Closet Duduk',
    image_url: '',
    description: '',
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
        image_url: room.image_url || '',
      });
    } else {
      const defaultType = roomTypes[0];
      setEditingRoom(null);
      setFormData({
        room_number: '',
        building_id: buildings[0]?.id || '',
        floor_id: floors[0]?.id || '',
        room_type_id: defaultType?.id || '',
        capacity: defaultType?.default_capacity || defaultType?.capacity || 2,
        rate_per_night: defaultType?.base_rate_per_night || defaultType?.base_rate || 250000,
        status: 'AVAILABLE',
        housekeeping_status: 'READY',
        notes: '',
        image_url: '',
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
        image_url: formData.image_url || editingRoom.image_url,
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
      image_url: formData.image_url || undefined,
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

  // Room Type CRUD Handlers
  const handleOpenTypeModal = (type?: RoomType) => {
    if (isHousekeeping) {
      toast.error('Akses Ditolak', 'Petugas Housekeeping tidak diizinkan mengubah master jenis kamar.');
      return;
    }

    if (type) {
      setEditingType(type);
      setTypeFormData({
        name: type.name,
        code: type.code,
        category: 'PENGINAPAN',
        rate_unit: 'PER_NIGHT',
        base_rate: type.base_rate_per_night || type.base_rate || 250000,
        capacity: type.default_capacity || type.capacity || 2,
        amenities: type.amenities.join(', '),
        image_url: type.image_url || '',
        description: type.description || '',
      });
    } else {
      setEditingType(null);
      setTypeFormData({
        name: '',
        code: '',
        category: 'PENGINAPAN',
        rate_unit: 'PER_NIGHT',
        base_rate: 250000,
        capacity: 2,
        amenities: 'Double Bed, AC, Meja, Lemari, Closet Duduk',
        image_url: '',
        description: '',
      });
    }
    setIsTypeModalOpen(true);
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeFormData.name || !typeFormData.code) {
      toast.error('Gagal', 'Nama dan kode tipe kamar wajib diisi.');
      return;
    }

    const amenitiesList = typeFormData.amenities
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    db.saveRoomType({
      id: editingType?.id,
      name: typeFormData.name,
      code: typeFormData.code.toUpperCase(),
      category: 'PENGINAPAN',
      rate_unit: 'PER_NIGHT',
      default_capacity: Number(typeFormData.capacity),
      capacity: Number(typeFormData.capacity),
      base_rate_per_night: Number(typeFormData.base_rate),
      base_rate: Number(typeFormData.base_rate),
      amenities: amenitiesList,
      image_url: typeFormData.image_url || undefined,
      description: typeFormData.description,
    }, currentUser || undefined);

    toast.success(
      editingType ? 'Tipe Kamar Diperbarui' : 'Tipe Kamar Ditambahkan',
      `Master jenis kamar "${typeFormData.name}" berhasil disimpan.`
    );
    setIsTypeModalOpen(false);
    loadData();
  };

  const handleDeleteType = () => {
    if (!typeDeleteTarget) return;
    const res = db.deleteRoomType(typeDeleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Berhasil', res.message);
      setTypeDeleteTarget(null);
      loadData();
    } else {
      toast.error('Gagal', res.message);
      setTypeDeleteTarget(null);
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
            Manajemen Data Penginapan & Kamar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan unit fisik kamar (32 kamar Gedung Mina) dan master jenis kamar (Superior & Standar) sesuai regulasi resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isHousekeeping ? (
            activeTab === 'ROOMS' ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => handleOpenModal()}
                icon={<Plus className="w-4 h-4" />}
              >
                Tambah Kamar Fisik
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={() => handleOpenTypeModal()}
                icon={<Plus className="w-4 h-4" />}
              >
                Tambah Jenis Kamar
              </Button>
            )
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Mode Housekeeping: Pembaruan Status & Kondisi</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher: Unit Fisik vs Master Jenis Kamar */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('ROOMS')}
          className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'ROOMS'
              ? 'border-[#c9a961] text-[#8a6d2b]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          <span>Unit Fisik Kamar ({rooms.length} Unit)</span>
        </button>

        <button
          onClick={() => setActiveTab('ROOM_TYPES')}
          className={`pb-3 px-2 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'ROOM_TYPES'
              ? 'border-[#c9a961] text-[#8a6d2b]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Master Jenis Kamar ({roomTypes.length} Tipe)</span>
        </button>
      </div>

      {activeTab === 'ROOMS' ? (
        <>
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
                    <th className="py-3 px-4 text-center">Status Unit</th>
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
        </>
      ) : (
        /* Room Types Tab */
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {roomTypes.map((rt) => {
              const linkedRooms = rooms.filter(r => r.room_type_id === rt.id);
              const availableRooms = linkedRooms.filter(r => r.status === 'AVAILABLE').length;

              return (
                <div
                  key={rt.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900">{rt.name}</h3>
                          <span className="text-xs font-mono font-bold bg-[#fbf8ee] text-[#8a6d2b] px-2 py-0.5 rounded border border-[#e8dfc8]">
                            {rt.code}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          Kategori: Penginapan &bull; Satuan: Per Malam
                        </span>
                      </div>

                      <span className="text-lg font-black text-[#8a6d2b]">
                        {formatCurrency(rt.base_rate_per_night || rt.base_rate || 250000)}
                        <span className="text-xs font-normal text-slate-500"> / malam</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed min-h-[32px]">
                      {rt.description || 'Tidak ada deskripsi'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Kapasitas</span>
                        <strong className="text-xs text-slate-800">{rt.default_capacity || rt.capacity || 2} Pax</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Unit Terdaftar</span>
                        <strong className="text-xs text-[#8a6d2b]">{linkedRooms.length} Kamar</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Tersedia</span>
                        <strong className="text-xs text-emerald-600">{availableRooms} Kamar</strong>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Fasilitas & Kelengkapan:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rt.amenities.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-[#fbf8ee] text-[#8a6d2b] border border-[#e8dfc8] px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-[#c9a961]" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Room numbers pill list */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Nomor Kamar Fisik Terhubung:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {linkedRooms.map((r) => (
                          <span
                            key={r.id}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                          >
                            {r.room_number}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {!isHousekeeping && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenTypeModal(rt)}
                        icon={<Edit className="w-3.5 h-3.5" />}
                      >
                        Edit Jenis Kamar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTypeDeleteTarget(rt)}
                        icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                      >
                        Hapus
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Kamar Fisik */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isHousekeeping ? `Pembaruan Kondisi & Kebersihan Kamar ${editingRoom?.room_number}` : editingRoom ? 'Edit Data Kamar Fisik' : 'Tambah Kamar Fisik Baru'}
        size="md"
      >
        <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nomor Kamar {isHousekeeping && <span className="text-slate-400 font-normal">(Terkunci)</span>} *
              </label>
              <input
                type="text"
                required
                readOnly={isHousekeeping}
                placeholder="Contoh: M101"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl font-bold uppercase focus:ring-2 focus:ring-[#c9a961] ${
                  isHousekeeping ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' : 'border-slate-200'
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
                onChange={(e) => {
                  const selectedTypeId = e.target.value;
                  const rt = roomTypes.find(t => t.id === selectedTypeId);
                  setFormData({
                    ...formData,
                    room_type_id: selectedTypeId,
                    rate_per_night: rt ? (rt.base_rate_per_night || rt.base_rate || formData.rate_per_night) : formData.rate_per_night,
                    capacity: rt ? (rt.default_capacity || rt.capacity || formData.capacity) : formData.capacity,
                  });
                }}
                className={`w-full px-3 py-2 border rounded-xl ${
                  isHousekeeping 
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                    : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#c9a961]'
                }`}
              >
                {roomTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code}) - {formatCurrency(t.base_rate_per_night || t.base_rate || 250000)}/mlm
                  </option>
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

          {/* Status & Kebersihan */}
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
                <option value="INACTIVE">INACTIVE (Nonaktif / Ditutup)</option>
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              URL Foto Unit Kamar (Opsional)
            </label>
            <input
              type="url"
              disabled={isHousekeeping}
              placeholder="https://images.unsplash.com/..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
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
              {isHousekeeping ? 'Simpan Kondisi & Status Kamar' : editingRoom ? 'Simpan Perubahan Kamar' : 'Simpan Kamar & Generate Bed'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Tambah / Edit Master Tipe Kamar */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title={editingType ? 'Edit Master Jenis Kamar' : 'Tambah Jenis Kamar Baru'}
        size="md"
      >
        <form onSubmit={handleSaveType} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Tipe Kamar *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Superior / Standar"
                value={typeFormData.name}
                onChange={(e) => setTypeFormData({ ...typeFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Tipe *</label>
              <input
                type="text"
                required
                placeholder="SUP / STD"
                value={typeFormData.code}
                onChange={(e) => setTypeFormData({ ...typeFormData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl uppercase font-bold focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tarif Dasar Per Malam (Rp) *</label>
              <input
                type="number"
                step="10000"
                required
                value={typeFormData.base_rate}
                onChange={(e) => setTypeFormData({ ...typeFormData, base_rate: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-[#8a6d2b] focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kapasitas Maksimal (Pax) *</label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={typeFormData.capacity}
                onChange={(e) => setTypeFormData({ ...typeFormData, capacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Daftar Fasilitas (Pisahkan dengan koma)</label>
            <input
              type="text"
              placeholder="Double Bed, AC, Meja, Lemari, Closet Duduk"
              value={typeFormData.amenities}
              onChange={(e) => setTypeFormData({ ...typeFormData, amenities: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi Tipe Kamar</label>
            <textarea
              rows={2}
              placeholder="Deskripsikan karakteristik tipe kamar ini..."
              value={typeFormData.description}
              onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Foto / URL Gambar Kamar</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={typeFormData.image_url}
              onChange={(e) => setTypeFormData({ ...typeFormData, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsTypeModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Jenis Kamar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete Room */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteRoom}
        title="Hapus Master Kamar"
        message={`Apakah Anda yakin ingin menghapus kamar "${deleteTarget?.room_number}"? Semua tempat tidur (${deleteTarget?.capacity} bed) terkait kamar ini juga akan dihapus. Kamar yang sedang dihuni tidak dapat dihapus.`}
        confirmText="Hapus Kamar"
        variant="danger"
      />

      {/* Confirmation Dialog Delete Room Type */}
      <ConfirmDialog
        isOpen={!!typeDeleteTarget}
        onClose={() => setTypeDeleteTarget(null)}
        onConfirm={handleDeleteType}
        title="Hapus Master Jenis Kamar"
        message={`Apakah Anda yakin ingin menghapus jenis kamar "${typeDeleteTarget?.name}"? Tipe kamar yang masih memiliki unit fisik aktif tidak dapat dihapus.`}
        confirmText="Hapus Tipe"
        variant="danger"
      />
    </div>
  );
};
