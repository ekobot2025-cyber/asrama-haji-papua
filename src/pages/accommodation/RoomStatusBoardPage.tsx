import React, { useState, useEffect } from 'react';
import { 
  Building2, BedDouble, Filter, Search, Calendar, 
  Users, CheckCircle2, Clock, Sparkles, Wrench, 
  AlertCircle, RefreshCw, Layers, ArrowRight, ShieldCheck,
  User, Phone, MapPin, Tag, LogIn, LogOut, Check
} from 'lucide-react';
import { db } from '../../db/database';
import { Room, Building, Floor, RoomType, Bed, Guest, RoomStatus, RoomAssignment, Reservation } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo, maskNik } from '../../utils/formatters';

interface RoomStatusBoardPageProps {
  onNavigate: (page: string, targetId?: string) => void;
}

export const RoomStatusBoardPage: React.FC<RoomStatusBoardPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Filters
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');
  const [searchNumber, setSearchNumber] = useState<string>('');

  // Selected room for detail modal
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = () => {
    setRooms(db.getRooms());
    setBeds(db.getBeds());
    setBuildings(db.getBuildings());
    setFloors(db.getFloors());
    setRoomTypes(db.getRoomTypes());
    setGuests(db.getGuests());
    setAssignments(db.getRoomAssignments());
    setReservations(db.getReservations());
  };

  useEffect(() => {
    loadData();
  }, []);

  const getBuildingName = (bldId: string) => {
    return buildings.find((b) => b.id === bldId)?.name || 'Gedung Asrama';
  };

  const getFloorName = (flrId: string) => {
    return floors.find((f) => f.id === flrId)?.name || 'Lantai';
  };

  const getRoomTypeName = (typeId: string) => {
    return roomTypes.find((t) => t.id === typeId)?.name || 'Standard';
  };

  const getBedsForRoom = (roomId: string) => {
    return beds.filter((b) => b.room_id === roomId);
  };

  // Helper to determine gender profile of a room
  const getRoomGenderProfile = (roomId: string) => {
    const activeAssigns = assignments.filter(
      (a) => a.room_id === roomId && (a.status === 'ACTIVE' || a.status === 'CHECKED_IN')
    );
    if (activeAssigns.length === 0) {
      return { type: 'EMPTY', label: 'Kosong', badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: '⚪' };
    }
    const assignedGuests = activeAssigns
      .map((a) => guests.find((g) => g.id === a.guest_id))
      .filter(Boolean) as Guest[];

    const hasMale = assignedGuests.some((g) => g.gender === 'L');
    const hasFemale = assignedGuests.some((g) => g.gender === 'P');

    if (hasMale && hasFemale) {
      return { type: 'MIXED', label: 'Campur / Keluarga', badge: 'bg-amber-100 text-amber-900 border-amber-300', icon: '👥' };
    }
    if (hasMale) {
      return { type: 'IKHWAN', label: 'Ikhwan (Pria)', badge: 'bg-teal-100 text-teal-900 border-teal-300', icon: '👳‍♂️' };
    }
    if (hasFemale) {
      return { type: 'AKHWAT', label: 'Akhwat (Wanita)', badge: 'bg-purple-100 text-purple-900 border-purple-300', icon: '🧕' };
    }
    return { type: 'EMPTY', label: 'Kosong', badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: '⚪' };
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedBuildingId !== 'all' && r.building_id !== selectedBuildingId) return false;
    if (selectedFloorId !== 'all' && r.floor_id !== selectedFloorId) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (selectedGenderFilter !== 'all') {
      const profile = getRoomGenderProfile(r.id);
      if (profile.type !== selectedGenderFilter) return false;
    }
    if (searchNumber && !r.room_number.toLowerCase().includes(searchNumber.toLowerCase())) return false;
    return true;
  });

  const handleOpenRoomModal = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (newStatus: RoomStatus) => {
    if (!selectedRoom || !currentUser) return;
    db.updateRoomStatus(selectedRoom.id, newStatus);
    toast.success('Status Diperbarui', `Kamar ${selectedRoom.room_number} berhasil diubah ke ${newStatus}.`);
    loadData();
    setSelectedRoom((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  const handleQuickMarkReady = () => {
    if (!selectedRoom || !currentUser) return;
    db.updateRoomStatus(selectedRoom.id, 'AVAILABLE');
    toast.success('Kamar Siap Digunakan', `Kamar ${selectedRoom.room_number} telah ditandai AVAILABLE (Selesai Inspeksi).`);
    loadData();
    setSelectedRoom((prev) => (prev ? { ...prev, status: 'AVAILABLE', housekeeping_status: 'READY' } : null));
  };

  // Group filtered rooms by Building & Floor
  const groupedRooms: Record<string, Room[]> = {};
  filteredRooms.forEach((r) => {
    const key = `${getBuildingName(r.building_id)} — ${getFloorName(r.floor_id)}`;
    if (!groupedRooms[key]) groupedRooms[key] = [];
    groupedRooms[key].push(r);
  });

  // Summary counts
  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const reservedCount = rooms.filter((r) => r.status === 'RESERVED').length;
  const cleaningCount = rooms.filter((r) => r.status === 'CLEANING').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-6">
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Peta Status Kamar & Tempat Tidur
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi status kamar, alokasi bed individual, dan kepatuhan syariah (Ikhwan / Akhwat) di seluruh wisma Asrama Haji Papua.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            icon={<RefreshCw className="w-4 h-4 text-emerald-800" />}
          >
            Muat Ulang
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('room-assignment')}
            icon={<Layers className="w-4 h-4" />}
          >
            Penempatan Kamar
          </Button>
        </div>
      </div>

      {/* Status Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <button
          onClick={() => setSelectedStatus(selectedStatus === 'AVAILABLE' ? 'all' : 'AVAILABLE')}
          className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all duration-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover ${
            selectedStatus === 'AVAILABLE' ? 'ring-2 ring-emerald-600 bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Available</p>
            <p className="text-2xl font-black text-emerald-800">{availableCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'OCCUPIED' ? 'all' : 'OCCUPIED')}
          className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all duration-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover ${
            selectedStatus === 'OCCUPIED' ? 'ring-2 ring-blue-600 bg-blue-50/70 border-blue-300' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Occupied</p>
            <p className="text-2xl font-black text-blue-800">{occupiedCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'RESERVED' ? 'all' : 'RESERVED')}
          className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all duration-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover ${
            selectedStatus === 'RESERVED' ? 'ring-2 ring-amber-600 bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reserved</p>
            <p className="text-2xl font-black text-amber-800">{reservedCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'CLEANING' ? 'all' : 'CLEANING')}
          className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all duration-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover ${
            selectedStatus === 'CLEANING' ? 'ring-2 ring-orange-600 bg-orange-50/70 border-orange-300' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cleaning</p>
            <p className="text-2xl font-black text-orange-600">{cleaningCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-500/20" />
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'MAINTENANCE' ? 'all' : 'MAINTENANCE')}
          className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all duration-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover ${
            selectedStatus === 'MAINTENANCE' ? 'ring-2 ring-rose-600 bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maintenance</p>
            <p className="text-2xl font-black text-rose-600">{maintenanceCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search Room */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Cari No Kamar
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Contoh: A101, B102..."
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Filter Gedung */}
        <div className="w-full sm:w-44">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Gedung
          </label>
          <select
            value={selectedBuildingId}
            onChange={(e) => {
              setSelectedBuildingId(e.target.value);
              setSelectedFloorId('all'); // Reset floor
            }}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="all">Semua Gedung</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
        </div>

        {/* Filter Lantai */}
        <div className="w-full sm:w-40">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Lantai
          </label>
          <select
            value={selectedFloorId}
            onChange={(e) => setSelectedFloorId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="all">Semua Lantai</option>
            {floors
              .filter((f) => selectedBuildingId === 'all' || f.building_id === selectedBuildingId)
              .map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
          </select>
        </div>

        {/* Filter Gender Syariah */}
        <div className="w-full sm:w-44">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Penempatan Syariah
          </label>
          <select
            value={selectedGenderFilter}
            onChange={(e) => setSelectedGenderFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="all">Semua Kamar</option>
            <option value="IKHWAN">👳‍♂️ Ikhwan (Pria)</option>
            <option value="AKHWAT">🧕 Akhwat (Wanita)</option>
            <option value="MIXED">👥 Campur / Mandiri</option>
            <option value="EMPTY">⚪ Kosong (Tersedia)</option>
          </select>
        </div>

        {/* Reset Filter Button */}
        {(selectedBuildingId !== 'all' || selectedFloorId !== 'all' || selectedStatus !== 'all' || selectedGenderFilter !== 'all' || searchNumber) && (
          <div className="self-end pb-0.5">
            <button
              onClick={() => {
                setSelectedBuildingId('all');
                setSelectedFloorId('all');
                setSelectedStatus('all');
                setSelectedGenderFilter('all');
                setSearchNumber('');
              }}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Hapus Filter
            </button>
          </div>
        )}
      </div>

      {/* Room Groups View */}
      {Object.keys(groupedRooms).length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          Tidak ada kamar yang sesuai dengan filter pencarian saat ini.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRooms).map(([groupTitle, roomList]) => (
            <div key={groupTitle} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              {/* Floor Group Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-800" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
                    {groupTitle}
                  </h3>
                  <span className="text-xs text-slate-400">({roomList.length} Kamar)</span>
                </div>
              </div>

              {/* Room Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {roomList.map((r) => {
                  const roomBeds = getBedsForRoom(r.id);
                  const occupiedBedsCount = roomBeds.filter((b) => b.status === 'OCCUPIED').length;
                  const genderProfile = getRoomGenderProfile(r.id);

                  // Card border color based on status
                  const statusStyles: Record<RoomStatus, { border: string; bg: string; text: string; topAccent: string }> = {
                    AVAILABLE: { border: 'border-slate-200/80 hover:border-emerald-400', bg: 'bg-white hover:bg-emerald-50/20', text: 'text-emerald-700', topAccent: 'bg-emerald-500' },
                    OCCUPIED: { border: 'border-slate-200/80 hover:border-blue-400', bg: 'bg-white hover:bg-blue-50/20', text: 'text-blue-700', topAccent: 'bg-blue-600' },
                    RESERVED: { border: 'border-slate-200/80 hover:border-amber-400', bg: 'bg-white hover:bg-amber-50/20', text: 'text-amber-700', topAccent: 'bg-amber-500' },
                    CLEANING: { border: 'border-slate-200/80 hover:border-orange-400', bg: 'bg-white hover:bg-orange-50/20', text: 'text-orange-700', topAccent: 'bg-orange-500' },
                    MAINTENANCE: { border: 'border-slate-200/80 hover:border-rose-400', bg: 'bg-white hover:bg-rose-50/20', text: 'text-rose-700', topAccent: 'bg-rose-500' },
                  };

                  const currentStyle = statusStyles[r.status];

                  return (
                    <div
                      key={r.id}
                      onClick={() => handleOpenRoomModal(r)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between ${currentStyle.border} ${currentStyle.bg} group relative overflow-hidden`}
                    >
                      {/* Top Accent Line */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${currentStyle.topAccent}`} />
                      <div>
                        {/* Header: Room Number and Status */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-base font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                            {r.room_number}
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                            r.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                            r.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-800' :
                            r.status === 'RESERVED' ? 'bg-amber-100 text-amber-800' :
                            r.status === 'CLEANING' ? 'bg-orange-100 text-orange-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {r.status}
                          </span>
                        </div>

                        {/* Gender Pill Badge */}
                        <div className="mb-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 w-max ${genderProfile.badge}`}>
                            <span>{genderProfile.icon}</span>
                            <span>{genderProfile.label}</span>
                          </span>
                        </div>

                        {/* Bed Capacity and Occupied indicator */}
                        <div className="text-[11px] text-slate-600 font-medium flex items-center justify-between mt-1">
                          <span>{r.capacity} Bed</span>
                          <span className="font-semibold text-slate-800">
                            {occupiedBedsCount}/{r.capacity} Terisi
                          </span>
                        </div>

                        {/* Bed indicators preview pills */}
                        <div className="flex items-center gap-1 mt-2">
                          {roomBeds.map((bed, idx) => (
                            <span
                              key={bed.id || idx}
                              title={`${bed.bed_code} (${bed.status})`}
                              className={`h-2 flex-1 rounded-full ${
                                bed.status === 'OCCUPIED' ? 'bg-blue-600' :
                                bed.status === 'RESERVED' ? 'bg-amber-500' :
                                bed.status === 'MAINTENANCE' ? 'bg-rose-500' :
                                'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Footer: Room Type & Rate */}
                      <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center justify-between">
                        <span className="truncate">{getRoomTypeName(r.room_type_id)}</span>
                        <span className="font-bold text-slate-700">{formatCurrency(r.rate_per_night)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Detail & Penghuni Kamar ${selectedRoom.room_number}`}
          subtitle={`${getBuildingName(selectedRoom.building_id)} — ${getFloorName(selectedRoom.floor_id)}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              {/* Quick status change buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">Ubah Status:</span>
                {(['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING', 'MAINTENANCE'] as RoomStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(st)}
                    disabled={selectedRoom.status === st}
                    className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                      selectedRoom.status === st
                        ? 'bg-slate-800 text-white cursor-default'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {selectedRoom.status === 'CLEANING' && (
                  <Button size="sm" variant="primary" onClick={handleQuickMarkReady} icon={<Check className="w-3.5 h-3.5" />}>
                    Tandai Selesai Bersih
                  </Button>
                )}
                {selectedRoom.status === 'OCCUPIED' && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => {
                      setIsModalOpen(false);
                      onNavigate('checkout');
                    }}
                    icon={<LogOut className="w-3.5 h-3.5" />}
                  >
                    Ke Menu Checkout
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                  Tutup
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Status and Rate Ribbon */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Jenis Kamar</span>
                <h4 className="text-sm font-bold text-slate-900">{getRoomTypeName(selectedRoom.room_type_id)}</h4>
                <p className="text-slate-500 text-[11px]">{formatCurrency(selectedRoom.rate_per_night)} / malam</p>
              </div>
              <div className="text-right space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Status Kamar</span>
                <Badge status={selectedRoom.status} size="md" />
              </div>
            </div>

            {/* Beds and Guest Allocations */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-800" /> Alokasi Tempat Tidur & Penghuni ({selectedRoom.capacity} Bed)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoomGenderProfile(selectedRoom.id).badge}`}>
                  {getRoomGenderProfile(selectedRoom.id).icon} {getRoomGenderProfile(selectedRoom.id).label}
                </span>
              </h4>

              <div className="space-y-2.5">
                {getBedsForRoom(selectedRoom.id).map((b) => {
                  const assign = assignments.find(
                    (a) => a.bed_id === b.id && (a.status === 'ACTIVE' || a.status === 'CHECKED_IN')
                  );
                  const guest = assign 
                    ? guests.find((g) => g.id === assign.guest_id) 
                    : (b.current_guest_id ? guests.find((g) => g.id === b.current_guest_id) : null);
                  const rsv = assign ? reservations.find((rv) => rv.id === assign.reservation_id) : null;

                  return (
                    <div 
                      key={b.id} 
                      className={`p-3 rounded-xl border transition-all ${
                        guest ? 'bg-blue-50/40 border-blue-200' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {b.bed_code}
                          </span>
                          <Badge status={b.status} size="sm" />
                        </div>

                        {guest && (
                          <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                            {guest.guest_type}
                          </span>
                        )}
                      </div>

                      {guest ? (
                        <div className="mt-2 text-xs space-y-1 bg-white p-2.5 rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              {guest.gender === 'L' ? '👳‍♂️' : '🧕'} {guest.full_name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              NIK: {maskNik(guest.nik)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>No. HP: {guest.phone}</span>
                            <span>Asal: {guest.regency_city}</span>
                          </div>
                          {rsv && (
                            <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                              <span>Reservasi: <strong className="text-slate-800">{rsv.reservation_no}</strong></span>
                              <span>Status: <strong className="text-emerald-700">{rsv.status}</strong></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic mt-1.5 ml-1">
                          Tempat tidur kosong dan siap ditempatkan tamu.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities & Facilities */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Fasilitas Kamar</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoom.amenities.map((item, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Housekeeping and Notes */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Status Housekeeping</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-slate-800">{selectedRoom.housekeeping_status}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Catatan Kamar</span>
                <p className="text-slate-600 mt-1 italic text-[11px]">
                  {selectedRoom.notes || 'Tidak ada catatan khusus.'}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
