import React, { useState, useEffect } from 'react';
import { 
  Building2, BedDouble, Filter, Search, Calendar, 
  Users, CheckCircle2, Clock, Sparkles, Wrench, 
  AlertCircle, RefreshCw, Layers, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { db } from '../../db/database';
import { Room, Building, Floor, RoomType, Bed, Guest, RoomStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo } from '../../utils/formatters';

interface RoomStatusBoardPageProps {
  onNavigate: (page: string, targetId?: string) => void;
}

export const RoomStatusBoardPage: React.FC<RoomStatusBoardPageProps> = ({ onNavigate }) => {
  const { currentUser, hasPermission } = useAuth();
  const toast = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);

  // Filters
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [selectedFloorId, setSelectedFloorId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
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
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedBuildingId !== 'all' && r.building_id !== selectedBuildingId) return false;
    if (selectedFloorId !== 'all' && r.floor_id !== selectedFloorId) return false;
    if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
    if (searchNumber && !r.room_number.toLowerCase().includes(searchNumber.toLowerCase())) return false;
    return true;
  });

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
            Peta Status Kamar (Room Status Board)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi status kamar dan alokasi tempat tidur (bed) di seluruh gedung UPT Asrama Haji Papua.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadData}
          icon={<RefreshCw className="w-4 h-4 text-emerald-800" />}
        >
          Muat Ulang Status
        </Button>
      </div>

      {/* Status Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setSelectedStatus(selectedStatus === 'AVAILABLE' ? 'all' : 'AVAILABLE')}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
            selectedStatus === 'AVAILABLE' ? 'ring-2 ring-emerald-600 bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Available</p>
            <p className="text-xl font-black text-emerald-700">{availableCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'OCCUPIED' ? 'all' : 'OCCUPIED')}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
            selectedStatus === 'OCCUPIED' ? 'ring-2 ring-blue-600 bg-blue-50/70 border-blue-300' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Occupied</p>
            <p className="text-xl font-black text-blue-700">{occupiedCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-blue-500" />
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'RESERVED' ? 'all' : 'RESERVED')}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
            selectedStatus === 'RESERVED' ? 'ring-2 ring-amber-600 bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Reserved</p>
            <p className="text-xl font-black text-amber-700">{reservedCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-amber-500" />
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'CLEANING' ? 'all' : 'CLEANING')}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
            selectedStatus === 'CLEANING' ? 'ring-2 ring-orange-600 bg-orange-50/70 border-orange-300' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Cleaning</p>
            <p className="text-xl font-black text-orange-600">{cleaningCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-orange-500" />
        </button>

        <button
          onClick={() => setSelectedStatus(selectedStatus === 'MAINTENANCE' ? 'all' : 'MAINTENANCE')}
          className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
            selectedStatus === 'MAINTENANCE' ? 'ring-2 ring-rose-600 bg-rose-50/70 border-rose-300' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase">Maintenance</p>
            <p className="text-xl font-black text-rose-600">{maintenanceCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-rose-500" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search Room */}
        <div className="flex-1 min-w-[200px]">
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
        <div className="w-full sm:w-48">
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
        <div className="w-full sm:w-44">
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

        {/* Reset Filter Button */}
        {(selectedBuildingId !== 'all' || selectedFloorId !== 'all' || selectedStatus !== 'all' || searchNumber) && (
          <div className="self-end pb-0.5">
            <button
              onClick={() => {
                setSelectedBuildingId('all');
                setSelectedFloorId('all');
                setSelectedStatus('all');
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

                  // Card border color based on status
                  const statusStyles: Record<RoomStatus, { border: string; bg: string; text: string }> = {
                    AVAILABLE: { border: 'border-emerald-200 hover:border-emerald-400', bg: 'bg-emerald-50/30', text: 'text-emerald-700' },
                    OCCUPIED: { border: 'border-blue-200 hover:border-blue-400', bg: 'bg-blue-50/30', text: 'text-blue-700' },
                    RESERVED: { border: 'border-amber-200 hover:border-amber-400', bg: 'bg-amber-50/30', text: 'text-amber-700' },
                    CLEANING: { border: 'border-orange-200 hover:border-orange-400', bg: 'bg-orange-50/30', text: 'text-orange-700' },
                    MAINTENANCE: { border: 'border-rose-200 hover:border-rose-400', bg: 'bg-rose-50/30', text: 'text-rose-700' },
                  };

                  const currentStyle = statusStyles[r.status];

                  return (
                    <div
                      key={r.id}
                      onClick={() => handleOpenRoomModal(r)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 hover:shadow-md flex flex-col justify-between ${currentStyle.border} ${currentStyle.bg} group`}
                    >
                      <div>
                        {/* Header: Room Number and Status */}
                        <div className="flex items-center justify-between mb-1.5">
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
          title={`Detail Kamar ${selectedRoom.room_number}`}
          subtitle={`${getBuildingName(selectedRoom.building_id)} — ${getFloorName(selectedRoom.floor_id)}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
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
              <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
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
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Status Saat Ini</span>
                <Badge status={selectedRoom.status} size="md" />
              </div>
            </div>

            {/* Beds List */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-800" /> Alokasi Tempat Tidur (Bed) ({selectedRoom.capacity} Bed)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {getBedsForRoom(selectedRoom.id).map((b) => (
                  <div key={b.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{b.bed_code}</p>
                      <p className="text-[10px] text-slate-500">
                        {b.current_guest_id ? 'Ditempati Tamu' : 'Kosong / Tersedia'}
                      </p>
                    </div>
                    <Badge status={b.status} size="sm" />
                  </div>
                ))}
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
