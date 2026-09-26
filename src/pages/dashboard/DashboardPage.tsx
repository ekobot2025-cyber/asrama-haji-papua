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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-haji-dark p-6 text-white shadow-md">
        {/* Subtle Papuan Geometric Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c59b27_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Pusat Komando Operasional
              </span>
              <span className="text-xs text-emerald-200">UPT Asrama Haji Provinsi Papua</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Selamat Datang, {currentUser?.name || 'Petugas Asrama Haji'}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Pantau ketersediaan kamar, arus kedatangan jamaah, kegiatan kedinasan, dan status operasional Asrama Haji secara langsung dan terintegrasi.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Button
              variant="amber"
              size="sm"
              onClick={() => onNavigate('reservations', 'new')}
              icon={<Plus className="w-4 h-4" />}
            >
              Reservasi Baru
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('room-status-board')}
              icon={<Hotel className="w-4 h-4 text-emerald-800" />}
              className="bg-white/90 hover:bg-white text-slate-800 border-none font-semibold"
            >
              Peta Kamar
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Section 1: Kapasitas & Inventaris Fisik */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shadow-2xs" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Kapasitas & Fasilitas Fisik Akomodasi
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
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
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-2xs" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Pergerakan Tamu & Operasional Hari Ini
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
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
