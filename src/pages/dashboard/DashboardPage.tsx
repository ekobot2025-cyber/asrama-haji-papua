import React, { useState, useEffect } from 'react';
import { 
  Building2, BedDouble, Layers, Users, CalendarCheck, 
  Clock, CheckCircle, Percent, Plus, Hotel, FileText, 
  Receipt, Sparkles, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { OccupancyCharts } from '../../components/dashboard/OccupancyCharts';
import { TodayOperations } from '../../components/dashboard/TodayOperations';
import { Button } from '../../components/common/Button';
import { db } from '../../db/database';
import { Room, Reservation, Bed, Building } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (page: string, targetId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const loadData = () => {
    setRooms(db.getRooms());
    setBeds(db.getBeds());
    setBuildings(db.getBuildings());
    setReservations(db.getReservations());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculate actual statistics from database
  const totalBuildings = buildings.length;
  const totalRooms = rooms.length;
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Today operations
  const today = '2026-09-26'; // Match simulated system date
  const todayCheckins = reservations.filter(
    (r) => (r.checkin_date === today || r.status === 'CONFIRMED') && r.status !== 'CHECKED_OUT' && r.status !== 'CANCELLED'
  );
  const todayCheckouts = reservations.filter(
    (r) => r.checkout_date === today || r.status === 'CHECKED_OUT'
  );
  const pendingReservations = reservations.filter((r) => r.status === 'PENDING');
  const upcomingReservations = reservations.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'VERIFIED'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner with subtle Papua & Islamic motif */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-haji-dark p-6 sm:p-7 text-white shadow-luxury border border-emerald-800/60">
        {/* Subtle Papuan Geometric Overlay & Ambient Glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c59b27_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-amber-300 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30 flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pusat Komando Operasional
              </span>
              <span className="text-xs text-emerald-200/90 font-medium">UPT Asrama Haji Provinsi Papua</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white pt-1">
              Selamat Datang, {currentUser?.name || 'Petugas Asrama Haji'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Pantau ketersediaan kamar, arus kedatangan jamaah, kegiatan kedinasan, dan status operasional Asrama Haji secara langsung dan terintegrasi.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('reservations', 'new')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Reservasi Baru</span>
            </button>
            <button
              onClick={() => onNavigate('room-status-board')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md shadow-xs transition-all duration-200 cursor-pointer"
            >
              <Hotel className="w-4 h-4 text-emerald-300" />
              <span>Peta Kamar</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Section 1: Kapasitas & Inventaris Fisik */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Kapasitas & Fasilitas Fisik Akomodasi
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-full border border-slate-200/60">
            Total {totalBeds} Bed Terdaftar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <KpiCard
            title="Total Gedung"
            value={totalBuildings}
            subtitle={buildings.length > 0 ? buildings.map(b => b.name).slice(0, 3).join(', ') : 'Gedung Akomodasi'}
            icon={Building2}
            colorScheme="slate"
            onClick={() => onNavigate('buildings')}
          />
          <KpiCard
            title="Total Kamar"
            value={totalRooms}
            subtitle="Suite, VIP, Deluxe, Superior"
            icon={BedDouble}
            colorScheme="emerald"
            onClick={() => onNavigate('rooms')}
          />
          <KpiCard
            title="Total Bed"
            value={totalBeds}
            subtitle="Tempat tidur terdata"
            icon={Layers}
            colorScheme="blue"
            onClick={() => onNavigate('beds')}
          />
          <KpiCard
            title="Bed Terisi"
            value={occupiedBeds}
            subtitle={`Dari ${totalBeds} kapasitas`}
            icon={Users}
            colorScheme="purple"
            onClick={() => onNavigate('room-status-board')}
          />
          <KpiCard
            title="Bed Tersedia"
            value={availableBeds}
            subtitle="Siap ditempati tamu"
            icon={CheckCircle}
            colorScheme="emerald"
            onClick={() => onNavigate('room-status-board')}
          />
        </div>
      </div>

      {/* KPI Section 2: Pergerakan Tamu & Operasional Hari Ini */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pergerakan Tamu & Operasional Hari Ini
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100/80 px-2.5 py-0.5 rounded-full border border-slate-200/60">
            Update Real-time WIT
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <KpiCard
            title="Tingkat Okupansi"
            value={`${occupancyRate}%`}
            subtitle="Rasio keterisian saat ini"
            icon={Percent}
            colorScheme="amber"
            trend={{ value: '8.4%', isPositive: true }}
            onClick={() => onNavigate('room-status-board')}
          />
          <KpiCard
            title="Check-in Hari Ini"
            value={todayCheckins.length}
            subtitle="Jadwal masuk hari ini"
            icon={CalendarCheck}
            colorScheme="emerald"
            onClick={() => onNavigate('checkin')}
          />
          <KpiCard
            title="Check-out Hari Ini"
            value={todayCheckouts.length}
            subtitle="Jadwal keluar hari ini"
            icon={Clock}
            colorScheme="blue"
            onClick={() => onNavigate('checkout')}
          />
          <KpiCard
            title="Reservasi Mendatang"
            value={upcomingReservations.length}
            subtitle="Terkonfirmasi & aktif"
            icon={CalendarCheck}
            colorScheme="purple"
            onClick={() => onNavigate('reservations')}
          />
          <KpiCard
            title="Menunggu Verifikasi"
            value={pendingReservations.length}
            subtitle="Perlu persetujuan"
            icon={AlertTriangle}
            colorScheme="rose"
            onClick={() => onNavigate('reservations')}
          />
        </div>
      </div>

      {/* Operational Center: Today's Checkins, Checkouts, and Pending Verification */}
      <TodayOperations
        todayCheckins={todayCheckins}
        todayCheckouts={todayCheckouts}
        pendingReservations={pendingReservations}
        onNavigate={onNavigate}
        onRefresh={loadData}
      />

      {/* Visual Analytics & Occupancy Charts */}
      <OccupancyCharts rooms={rooms} />
    </div>
  );
};
