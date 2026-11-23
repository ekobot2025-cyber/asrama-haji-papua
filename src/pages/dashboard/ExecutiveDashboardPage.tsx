import React, { useState, useRef } from 'react';
import { 
  Award, TrendingUp, DollarSign, Users, Briefcase, 
  Calendar, Printer, Download, Filter, Building2, 
  BedDouble, CheckCircle2, ChevronRight, BarChart3, Loader2
} from 'lucide-react';
import { db } from '../../db/database';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { downloadElementAsPdf, printElementDirectly } from '../../utils/pdfGenerator';
import { useToast } from '../../context/ToastContext';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

export const ExecutiveDashboardPage: React.FC = () => {
  const toast = useToast();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');

  const reservations = db.getReservations();
  const rooms = db.getRooms();
  const beds = db.getBeds();
  const payments = db.getPayments();
  const invoices = db.getInvoices();
  const groups = db.getGroups();
  const guests = db.getGuests();
  const roomAssignments = db.getRoomAssignments();
  const buildings = db.getBuildings();

  // Helper date filter
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const isWithinFilter = (dateStr?: string): boolean => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (timeFilter === 'today') {
      return dateStr.startsWith(todayStr);
    } else if (timeFilter === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo && d <= now;
    } else if (timeFilter === 'month') {
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return dateStr.startsWith(currentYearMonth);
    } else if (timeFilter === 'year') {
      return dateStr.startsWith(String(now.getFullYear()));
    }
    return true;
  };

  const filteredPayments = payments.filter(p => isWithinFilter(p.payment_date));
  const filteredReservations = reservations.filter(r => 
    isWithinFilter(r.checkin_date) || isWithinFilter(r.reservation_date)
  );

  // Aggregate executive metrics
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalGuestsServed = filteredReservations.reduce((sum, r) => sum + (r.total_guests || 1), 0);
  const totalGroupsServed = groups.filter(g => isWithinFilter(g.created_at)).length;
  const totalActivities = filteredReservations.length;

  const totalActiveBeds = beds.filter(b => b.status !== 'MAINTENANCE').length || (rooms.length * 2);
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
  const currentOccupancy = totalActiveBeds > 0 ? Math.round((occupiedBeds / totalActiveBeds) * 100) : 0;

  // Revenue by Category calculated from actual transactions
  let sewaKamarAmount = 0;
  let sewaAulaAmount = 0;
  let lapanganManasikAmount = 0;
  let layananAmount = 0;

  filteredPayments.forEach(pay => {
    const inv = invoices.find(i => i.id === pay.invoice_id);
    const rsv = inv ? reservations.find(r => r.id === inv.reservation_id) : undefined;
    
    if (rsv) {
      if (
        rsv.rental_category === 'RUANG_PERTEMUAN' || 
        rsv.facility_id?.startsWith('fac-01') || 
        rsv.facility_id?.startsWith('fac-07')
      ) {
        sewaAulaAmount += pay.amount;
      } else if (rsv.facility_id === 'fac-05') {
        lapanganManasikAmount += pay.amount;
      } else {
        sewaKamarAmount += pay.amount;
      }
    } else {
      sewaKamarAmount += pay.amount;
    }
  });

  const revenueByCategory = [
    { name: 'Sewa Kamar', amount: sewaKamarAmount, color: '#c9a961' },
    { name: 'Sewa Aula & Ruang Rapat', amount: sewaAulaAmount, color: '#C59B27' },
    { name: 'Lapangan Manasik', amount: lapanganManasikAmount, color: '#2563eb' },
    { name: 'Layanan & Kebersihan', amount: layananAmount, color: '#7c3aed' },
  ];

  // Most Occupied Rooms from real roomAssignments / reservations
  const roomUsageMap: Record<string, number> = {};
  roomAssignments.forEach(asg => {
    const rsv = reservations.find(r => r.id === asg.reservation_id);
    if (rsv && isWithinFilter(rsv.checkin_date)) {
      const nights = rsv.duration || 1;
      roomUsageMap[asg.room_id] = (roomUsageMap[asg.room_id] || 0) + nights;
    }
  });

  const maxDaysInPeriod = timeFilter === 'today' ? 1 : timeFilter === 'week' ? 7 : timeFilter === 'month' ? 30 : 365;
  const activeRooms = rooms.filter(r => r.status !== 'INACTIVE');
  const topRooms = [...activeRooms]
    .map(room => {
      const daysOccupied = roomUsageMap[room.id] || 0;
      const occupancy = Math.min(100, Math.round((daysOccupied / maxDaysInPeriod) * 100));
      const roomTypeName = room.room_type_id === 'rt-spr' ? 'Superior' : 'Standar';
      const buildingName = buildings.find(b => b.id === room.building_id)?.name || 'Gedung Madinah';
      return {
        room: `Kamar ${room.room_number} (${roomTypeName})`,
        bld: buildingName,
        daysOccupied,
        occupancy,
      };
    })
    .sort((a, b) => b.daysOccupied - a.daysOccupied)
    .slice(0, 5);

  const handleDirectPrint = () => {
    if (!dashboardRef.current) return;
    const filename = `Dashboard_Eksekutif_SIMAHA_${timeFilter}_${new Date().toISOString().split('T')[0]}`;
    printElementDirectly(dashboardRef.current, filename, { orientation: 'landscape' });
    toast.info('Menyiapkan Cetak', 'Dialog cetak dibuka langsung tanpa tab baru.');
  };

  const handleDownloadDashboardPdf = async () => {
    if (!dashboardRef.current) return;
    setIsGeneratingPdf(true);
    const filename = `Dashboard_Eksekutif_SIMAHA_${timeFilter}_${new Date().toISOString().split('T')[0]}`;
    try {
      await downloadElementAsPdf(dashboardRef.current, filename, {
        orientation: 'landscape',
        openInNewTab: false,
        scale: 2,
      });
      toast.success('Ringkasan Eksekutif PDF Berhasil Dibuat', `File ${filename}.pdf telah siap.`);
    } catch (err) {
      console.error('Executive PDF error:', err);
      toast.error('Gagal Ekspor PDF', 'Terjadi kesalahan saat memproses Dashboard Eksekutif PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900">
              <Award className="w-5 h-5 text-amber-700" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dashboard Eksekutif Pimpinan
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan eksekutif performa pelayanan, tingkat hunian, dan penerimaan UPT Asrama Haji Papua.
          </p>
        </div>

        {/* Time Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            {(['today', 'week', 'month', 'year'] as const).map((filter) => {
              const labels = {
                today: 'Hari Ini',
                week: 'Minggu Ini',
                month: 'Bulan Ini',
                year: 'Tahun 2026',
              };
              return (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    timeFilter === filter
                      ? 'bg-white text-[#8a6d2b] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[filter]}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDirectPrint}
            icon={<Printer className="w-4 h-4 text-[#8a6d2b]" />}
            className="hidden sm:inline-flex bg-white"
            title="Cetak langsung ringkasan eksekutif tanpa membuka tab baru"
          >
            Cetak Langsung
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownloadDashboardPdf}
            disabled={isGeneratingPdf}
            icon={isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            className="inline-flex"
          >
            {isGeneratingPdf ? 'Membuat PDF...' : 'Unduh PDF (.pdf)'}
          </Button>
        </div>
      </div>

      {/* Main Dashboard Printable Container */}
      <div ref={dashboardRef} className="space-y-6 bg-slate-50/50 p-2 sm:p-4 rounded-2xl">
        {/* KPI Cards for Executives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Okupansi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>OKUPANSI RATA-RATA</span>
            <TrendingUp className="w-4 h-4 text-[#c9a961]" />
          </div>
          <div className="text-3xl font-black text-slate-900">{currentOccupancy}%</div>
          <p className="text-[11px] text-[#8a6d2b] font-semibold mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a961]" /> {occupiedBeds} dari {totalActiveBeds} bed terisi
          </p>
        </div>

        {/* Total Tamu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>TOTAL TAMU TERLAYANI</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalGuestsServed}</div>
          <p className="text-[11px] text-slate-500 mt-1.5">Jamaah, Kedinasan & Peserta</p>
        </div>

        {/* Total Rombongan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>ROMBONGAN & KLOTER</span>
            <Briefcase className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalGroupsServed}</div>
          <p className="text-[11px] text-slate-500 mt-1.5">Kloter Haji & Instansi</p>
        </div>

        {/* Total Kegiatan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>TOTAL AGENDA / EVENT</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{totalActivities}</div>
          <p className="text-[11px] text-slate-500 mt-1.5">Manasik, Bimtek & Rapat</p>
        </div>

        {/* Pendapatan */}
        <div className="bg-white p-5 rounded-2xl border border-[#e8dfc8] shadow-xs bg-gradient-to-br from-[#fbf8ee] to-[#FAF9F5]">
          <div className="flex items-center justify-between text-xs text-[#8a6d2b] font-semibold mb-1">
            <span>TOTAL PENERIMAAN (PNBP)</span>
            <DollarSign className="w-4 h-4 text-[#8a6d2b]" />
          </div>
          <div className="text-2xl font-black text-[#8a6d2b] truncate">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-[#8a6d2b] font-semibold mt-1.5">Penerimaan resmi disetor ke kas</p>
        </div>
      </div>

      {/* Analytics Section 1: Financial & Occupancy Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Source */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Komposisi Penerimaan PNBP</h4>
          <p className="text-xs text-slate-500 mb-4">Berdasarkan unit layanan Asrama Haji Papua</p>

          {totalRevenue === 0 ? (
            <div className="h-56 w-full flex flex-col items-center justify-center text-slate-400 text-xs gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400">
                <DollarSign className="w-6 h-6 text-slate-300" />
              </div>
              <span>Belum ada penerimaan PNBP pada periode ini.</span>
            </div>
          ) : (
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategory.filter(i => i.amount > 0)}
                    dataKey="amount"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {revenueByCategory.filter(i => i.amount > 0).map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => [formatCurrency(val), 'Penerimaan']} 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 text-xs">
            {revenueByCategory.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Occupied Rooms Table */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Kamar Paling Banyak Digunakan</h4>
              <p className="text-xs text-slate-500">Tingkat utilisasi kamar tertinggi periode ini</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-1 rounded-lg">
              Top 5 Kamar
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Nomor & Jenis Kamar</th>
                  <th className="py-2.5 px-3 font-semibold">Gedung</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Hari Terisi</th>
                  <th className="py-2.5 px-3 font-semibold">Rasio Utilisasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topRooms.length === 0 || topRooms.every(r => r.daysOccupied === 0) ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-xs text-slate-400">
                      Belum ada pemakaian kamar pada periode ini.
                    </td>
                  </tr>
                ) : (
                  topRooms.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{r.room}</td>
                      <td className="py-3 px-3 text-slate-600">{r.bld}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-800">{r.daysOccupied} Hari</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#c9a961] h-full rounded-full"
                              style={{ width: `${r.occupancy}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800 w-9 text-right">{r.occupancy}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
