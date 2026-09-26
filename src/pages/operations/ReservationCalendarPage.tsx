import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, ChevronLeft, ChevronRight, Calendar, 
  Users, CheckCircle2, Clock, Landmark, Filter 
} from 'lucide-react';
import { db } from '../../db/database';
import { Reservation, FacilityReservation, Guest, Group } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 26)); // September 2026
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reservations = db.getReservations();
  const guests = db.getGuests();
  const groups = db.getGroups();

  const getGuestOrGroupName = (rsv: Reservation): string => {
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

  // Convert reservations to events
  const events: CalendarEvent[] = [];
  reservations.forEach((r) => {
    const name = getGuestOrGroupName(r);
    // Check-in event
    events.push({
      id: `${r.id}-cin`,
      title: `[Masuk] ${name}`,
      type: 'CHECKIN',
      date: r.checkin_date,
      data: r,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    });
    // Check-out event
    events.push({
      id: `${r.id}-cout`,
      title: `[Keluar] ${name}`,
      type: 'CHECKOUT',
      date: r.checkout_date,
      data: r,
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    });
  });

  // Calendar matrix calculation for September 2026
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 8 = September

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

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

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-emerald-800" />
            Kalender Reservasi & Jadwal Agenda
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi kalender arus check-in, check-out, kedatangan jamaah haji, dan penggunaan ruang aula.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-xs p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs sm:text-sm text-slate-800 px-4 min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigate('reservations', 'new')}
          >
            + Buat Reservasi
          </Button>
        </div>
      </div>

      {/* Calendar Grid View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold text-slate-600 py-3">
          <div className="text-rose-600">Minggu</div>
          <div>Senin</div>
          <div>Selasa</div>
          <div>Rabu</div>
          <div>Kamis</div>
          <div>Jumat</div>
          <div className="text-emerald-800">Sabtu</div>
        </div>

        {/* Days grid */}
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

                {/* Day events stack */}
                <div className="space-y-1 overflow-y-auto max-h-[85px]">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => handleEventClick(evt)}
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

      {/* Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedEvent.title}
          subtitle={`Tanggal: ${formatDateIndo(selectedEvent.date)}`}
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
                Lihat Detail Reservasi &rarr;
              </Button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">No. Reservasi:</span>
                <span className="font-mono font-bold text-emerald-900">{selectedEvent.data.reservation_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Agenda / Kegiatan:</span>
                <span className="font-semibold text-slate-800">{selectedEvent.data.activity_name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jumlah Tamu:</span>
                <span className="font-bold text-slate-800">{selectedEvent.data.total_guests} Orang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Reservasi:</span>
                <Badge status={selectedEvent.data.status} size="sm" />
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
    </div>
  );
};
