import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, ChevronLeft, ChevronRight, Calendar, 
  Users, CheckCircle2, Clock, Landmark, Filter, Hotel, 
  Layers, BedDouble, Plus, AlertCircle, Sparkles, Wrench, ShieldCheck, Check
} from 'lucide-react';
import { db } from '../../db/database';
import { Reservation, Guest, Group, Room, RoomType, Building, RoomAssignment } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { WalkInModal } from '../../components/operations/WalkInModal';
import { formatDateIndo, formatCurrency } from '../../utils/formatters';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'CHECKIN' | 'CHECKOUT' | 'RESERVATION' | 'EVENT';
  date: string;
  data: any;
  color: string;
}

export const ReservationCalendarPage: React.FC<{ onNavigate: (page: string, targetId?: string) => void }> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'tape_chart' | 'month'>('tape_chart');

  // Month Calendar Date State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 26)); // September 2026

  // Hotel Tape Chart / Room Rack Timeline Start Date (14 days window)
  const [tapeStartDate, setTapeStartDate] = useState(new Date(2026, 8, 25)); // Starts 25 Sep 2026
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [walkInRoomId, setWalkInRoomId] = useState<string | undefined>(undefined);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);

  const loadData = () => {
    setReservations(db.getReservations());
    setGuests(db.getGuests());
    setGroups(db.getGroups());
    setRooms(db.getRooms());
    setRoomTypes(db.getRoomTypes());
    setBuildings(db.getBuildings());
    setAssignments(db.getRoomAssignments());
  };

  useEffect(() => {
    loadData();
  }, []);

  const getGuestOrGroupName = (rsv?: Reservation | null): string => {
    if (!rsv) return '';
    if (rsv.group_id) {
      const g = groups.find((grp) => grp.id === rsv.group_id);
      if (g) return g.group_name;
    }
    if (rsv.guest_id) {
      const gst = guests.find((g) => g.id === rsv.guest_id);
      if (gst) return gst.full_name;
    }
    return rsv.activity_name || 'Tamu';
  };

  // Convert reservations to events for Month Grid
  const events: CalendarEvent[] = [];
  reservations.forEach((r) => {
    const name = getGuestOrGroupName(r);
    events.push({
      id: `${r.id}-cin`,
      title: `[Masuk] ${name}`,
      type: 'CHECKIN',
      date: r.checkin_date,
      data: r,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    });
    events.push({
      id: `${r.id}-cout`,
      title: `[Keluar] ${name}`,
      type: 'CHECKOUT',
      date: r.checkout_date,
      data: r,
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    });
  });

  // Calendar matrix calculation for Month Grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Tape Chart / Room Rack Timeline calculation (14 consecutive days)
  const tapeDaysCount = 14;
  const tapeDates: { dateObj: Date; dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
  for (let i = 0; i < tapeDaysCount; i++) {
    const d = new Date(tapeStartDate);
    d.setDate(d.getDate() + i);
    const yStr = d.getFullYear();
    const mStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yStr}-${mStr}-${dayStr}`;

    const daysShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const isToday = dateStr === '2026-09-26';

    tapeDates.push({
      dateObj: d,
      dateStr,
      dayName: daysShort[d.getDay()],
      dayNum: d.getDate(),
      isToday,
    });
  }

  const handlePrevTape = () => {
    const d = new Date(tapeStartDate);
    d.setDate(d.getDate() - 7);
    setTapeStartDate(d);
  };

  const handleNextTape = () => {
    const d = new Date(tapeStartDate);
    d.setDate(d.getDate() + 7);
    setTapeStartDate(d);
  };

  const handleResetToToday = () => {
    setTapeStartDate(new Date(2026, 8, 25));
  };

  const filteredRooms = rooms.filter((r) => {
    if (selectedBuildingId !== 'all' && r.building_id !== selectedBuildingId) return false;
    return true;
  });

  const getBuildingName = (bldId: string) => {
    return buildings.find((b) => b.id === bldId)?.name || 'Gedung';
  };

  const getRoomTypeName = (tId: string) => {
    return roomTypes.find((t) => t.id === tId)?.name || 'Standard';
  };

  // Find active reservation occupying a specific room on a specific date
  const getReservationForRoomDate = (roomId: string, dateStr: string) => {
    const roomAssigns = assignments.filter((a) => a.room_id === roomId && a.status !== 'CANCELLED');
    if (roomAssigns.length === 0) return null;

    for (const a of roomAssigns) {
      const r = reservations.find((res) => res.id === a.reservation_id);
      if (r && r.status !== 'CANCELLED' && r.status !== 'REJECTED') {
        if (r.checkin_date <= dateStr && dateStr <= r.checkout_date) {
          return { reservation: r, assignment: a };
        }
      }
    }
    return null;
  };

  // Calculate daily occupancy rate across tape chart
  const getDayOccupancy = (dateStr: string) => {
    let occupiedCount = 0;
    filteredRooms.forEach((r) => {
      const occ = getReservationForRoomDate(r.id, dateStr);
      if (occ) occupiedCount++;
    });
    const total = filteredRooms.length;
    const pct = total > 0 ? Math.round((occupiedCount / total) * 100) : 0;
    return { occupiedCount, total, pct };
  };

  const handleCellClick = (room: Room, dateStr: string, occData: any) => {
    if (occData) {
      setSelectedEvent({
        id: occData.reservation.id,
        title: getGuestOrGroupName(occData.reservation),
        type: 'RESERVATION',
        date: dateStr,
        data: occData.reservation,
        color: 'bg-emerald-100 text-emerald-800',
      });
      setIsModalOpen(true);
    } else {
      setWalkInRoomId(room.id);
      setIsWalkInOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & View Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Hotel className="w-6 h-6 text-emerald-800" />
            Bagan Jadwal & Room Rack (Tape Chart Hotel)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi kalender okupansi kamar perhotelan, arus kedatangan (check-in), dan reservasi Asrama Haji Papua.
          </p>
        </div>

        {/* View Mode Toggle & Walk-In Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setActiveTab('tape_chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tape_chart'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Room Rack / Tape Chart</span>
            </button>
            <button
              onClick={() => setActiveTab('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'month'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Kalender Bulanan</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="amber"
            onClick={() => {
              setWalkInRoomId(undefined);
              setIsWalkInOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            Tamu Walk-In
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: HOTEL TAPE CHART / ROOM RACK TIMELINE (RECOMMENDED) */}
      {/* ========================================================= */}
      {activeTab === 'tape_chart' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Timeline Navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevTape}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                title="7 Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">-7 Hari</span>
              </button>

              <button
                onClick={handleResetToToday}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
              >
                Hari Ini (26 Sep)
              </button>

              <button
                onClick={handleNextTape}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                title="7 Hari Berikutnya"
              >
                <span className="hidden sm:inline">+7 Hari</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-slate-600 ml-2">
                Periode: <strong>{formatDateIndo(tapeDates[0].dateStr)}</strong> s/d <strong>{formatDateIndo(tapeDates[tapeDaysCount - 1].dateStr)}</strong>
              </span>
            </div>

            {/* Building Filter & Legend */}
            <div className="flex items-center gap-3">
              <div className="w-44">
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
                >
                  <option value="all">Semua Gedung</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Color Legend Bar */}
          <div className="flex items-center gap-4 text-[11px] text-slate-600 flex-wrap px-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Status Grid:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600" />
              <span>In-House (Occupied)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-600" />
              <span>Confirmed (Pasti)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>Reserved (Pemesanan)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-400" />
              <span>Cleaning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Maintenance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-white border border-slate-300" />
              <span>Kosong (Klik untuk pesan)</span>
            </div>
          </div>

          {/* Hotel Room Rack / Tape Chart Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                    {/* Sticky Room Header */}
                    <th className="sticky left-0 z-20 bg-slate-100 p-3 min-w-[200px] border-r border-slate-200 text-left font-black uppercase tracking-wider text-[10px]">
                      Kamar & Tipe Wisma
                    </th>
                    {/* 14 Date Columns */}
                    {tapeDates.map((td) => (
                      <th
                        key={td.dateStr}
                        className={`p-2 min-w-[70px] text-center border-r border-slate-200 font-bold ${
                          td.isToday ? 'bg-emerald-100/70 text-emerald-950 font-black' : ''
                        }`}
                      >
                        <div className="text-[10px] text-slate-500 uppercase">{td.dayName}</div>
                        <div className={`text-sm ${td.isToday ? 'text-emerald-800' : 'text-slate-800'}`}>
                          {td.dayNum}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredRooms.map((room) => {
                    const bldName = getBuildingName(room.building_id);
                    const tName = getRoomTypeName(room.room_type_id);

                    return (
                      <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Sticky Left Room Info */}
                        <td className="sticky left-0 z-10 bg-white p-2.5 border-r border-slate-200 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm text-slate-900">{room.room_number}</span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              room.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                              room.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-800' :
                              room.status === 'RESERVED' ? 'bg-amber-100 text-amber-800' :
                              room.status === 'CLEANING' ? 'bg-orange-100 text-orange-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {room.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                            <span className="truncate max-w-[110px]">{tName}</span>
                            <span>{room.capacity} Bed</span>
                          </div>
                        </td>

                        {/* 14 Date Cells for this room */}
                        {tapeDates.map((td) => {
                          const occData = getReservationForRoomDate(room.id, td.dateStr);

                          if (occData) {
                            const r = occData.reservation;
                            const isCheckinDay = td.dateStr === r.checkin_date;
                            const isCheckoutDay = td.dateStr === r.checkout_date;
                            const guestName = getGuestOrGroupName(r);

                            const colorBg = 
                              r.status === 'CHECKED_IN' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                              r.status === 'CONFIRMED' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                              'bg-amber-500 text-white hover:bg-amber-600';

                            return (
                              <td
                                key={td.dateStr}
                                onClick={() => handleCellClick(room, td.dateStr, occData)}
                                className={`p-1 border-r border-slate-200 text-center cursor-pointer transition-all ${
                                  td.isToday ? 'bg-emerald-50/30' : ''
                                }`}
                                title={`${guestName} (${r.reservation_no}) • ${r.status}`}
                              >
                                <div className={`p-1.5 rounded-lg text-[9px] font-bold truncate shadow-2xs leading-tight ${colorBg}`}>
                                  {isCheckinDay ? `👉 ${guestName}` : isCheckoutDay ? `👈 ${guestName}` : guestName}
                                </div>
                              </td>
                            );
                          }

                          // Room not reserved on this date
                          const isRoomCleaningToday = room.status === 'CLEANING' && td.isToday;
                          const isRoomMnt = room.status === 'MAINTENANCE';

                          if (isRoomCleaningToday) {
                            return (
                              <td key={td.dateStr} className="p-1 border-r border-slate-200 text-center bg-orange-50/60">
                                <span className="text-[9px] font-bold text-orange-700 block">🧹 Clean</span>
                              </td>
                            );
                          }

                          if (isRoomMnt) {
                            return (
                              <td key={td.dateStr} className="p-1 border-r border-slate-200 text-center bg-rose-50/60">
                                <span className="text-[9px] font-bold text-rose-700 block">🛠️ Rusak</span>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={td.dateStr}
                              onClick={() => handleCellClick(room, td.dateStr, null)}
                              className={`p-1 border-r border-slate-200 text-center cursor-pointer hover:bg-emerald-50/50 group transition-colors ${
                                td.isToday ? 'bg-emerald-50/20' : ''
                              }`}
                              title={`Kamar ${room.room_number} Kosong pada ${formatDateIndo(td.dateStr)}. Klik untuk Walk-in / Pesan.`}
                            >
                              <div className="h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-emerald-700 font-bold text-xs">+</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>

                {/* Daily Occupancy Summary Footer */}
                <tfoot>
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-300 text-slate-800 text-[10px]">
                    <td className="sticky left-0 z-20 bg-slate-100 p-2.5 border-r border-slate-200 uppercase tracking-wider">
                      Okupansi Harian
                    </td>
                    {tapeDates.map((td) => {
                      const occ = getDayOccupancy(td.dateStr);
                      return (
                        <td
                          key={td.dateStr}
                          className={`p-2 text-center border-r border-slate-200 font-bold ${
                            td.isToday ? 'bg-emerald-200/60 text-emerald-950 font-black' : ''
                          }`}
                        >
                          <span className={`px-1.5 py-0.5 rounded ${
                            occ.pct >= 70 ? 'bg-emerald-100 text-emerald-800' :
                            occ.pct >= 40 ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {occ.pct}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: MONTHLY AGENDA GRID (TRADITIONAL VIEW) */}
      {/* ========================================================= */}
      {activeTab === 'month' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-lg border hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="font-extrabold text-sm text-slate-900 min-w-[140px] text-center">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-lg border hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-600 py-3">
              <div className="text-rose-600">Minggu</div>
              <div>Senin</div>
              <div>Selasa</div>
              <div>Rabu</div>
              <div>Kamis</div>
              <div>Jumat</div>
              <div className="text-emerald-800">Sabtu</div>
            </div>

            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs">
              {daysArray.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="min-h-[110px] bg-slate-50/40 p-2" />;
                }

                const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = events.filter((e) => e.date === dayString);
                const isToday = day === 26 && month === 8 && year === 2026;

                return (
                  <div
                    key={`day-${day}`}
                    className={`min-h-[110px] p-2 transition-colors flex flex-col justify-between ${
                      isToday ? 'bg-emerald-50/40 ring-2 ring-emerald-600 inset-0' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          isToday ? 'bg-emerald-800 text-white' : 'text-slate-800'
                        }`}
                      >
                        {day}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          Hari Ini
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[85px]">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          onClick={() => {
                            setSelectedEvent(evt);
                            setIsModalOpen(true);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold truncate border cursor-pointer hover:shadow-xs transition-shadow ${evt.color}`}
                        >
                          {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reservation Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Detail Reservasi: ${selectedEvent.data.reservation_no}`}
          subtitle={`Tamu / Rombongan: ${getGuestOrGroupName(selectedEvent.data)}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setIsModalOpen(false);
                  onNavigate('reservations', selectedEvent.data.id);
                }}
              >
                Buka Folio Reservasi &rarr;
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pemesan:</span>
                <span className="font-bold text-slate-900">{getGuestOrGroupName(selectedEvent.data)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kegiatan / Instansi:</span>
                <span className="font-medium text-slate-800">{selectedEvent.data.activity_name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Tamu:</span>
                <span className="font-bold text-slate-900">{selectedEvent.data.total_guests} Orang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Reservasi:</span>
                <Badge status={selectedEvent.data.status} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Pembayaran:</span>
                <span className={`font-bold ${selectedEvent.data.payment_status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedEvent.data.payment_status === 'PAID' ? 'LUNAS' : formatCurrency(selectedEvent.data.remaining_amount)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
              <p className="font-bold">Periode Menginap:</p>
              <p className="mt-0.5 text-xs">
                {formatDateIndo(selectedEvent.data.checkin_date)} s/d {formatDateIndo(selectedEvent.data.checkout_date)}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Hotel Walk-in Modal */}
      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onSuccess={loadData}
        defaultRoomId={walkInRoomId}
      />
    </div>
  );
};
