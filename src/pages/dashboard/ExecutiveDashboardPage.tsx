import React, { useState, useRef } from 'react';
import { 
  Award, TrendingUp, DollarSign, Users, Briefcase, 
  Calendar, Printer, Download, Filter, Building2, 
  BedDouble, CheckCircle2, ChevronRight, BarChart3, Loader2
} from 'lucide-react';
import { db } from '../../db/database';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { downloadElementAsPdf } from '../../utils/pdfGenerator';
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
  const payments = db.getPayments();
  const groups = db.getGroups();
  const guests = db.getGuests();

  // Aggregate executive metrics
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalGuestsServed = guests.length + 85; // include rombongan
  const totalGroupsServed = groups.length;
  const totalActivities = reservations.length;
  const currentOccupancy = 78; // %

  // Revenue by Category
  const revenueByCategory = [
    { name: 'Sewa Kamar', amount: 38500000, color: '#0F5132' },
    { name: 'Sewa Aula & Ruang Rapat', amount: 12500000, color: '#C59B27' },
    { name: 'Lapangan Manasik', amount: 4000000, color: '#2563eb' },
    { name: 'Layanan & Kebersihan', amount: 2400000, color: '#7c3aed' },
  ];

  // Most Occupied Rooms
  const topRooms = [
    { room: 'Kamar A101 (Standard)', bld: 'Gedung Nabire', daysOccupied: 26, occupancy: 87 },
    { room: 'Kamar B101 (Rombongan)', bld: 'Gedung Jayapura', daysOccupied: 25, occupancy: 83 },
    { room: 'Kamar A201 (VIP Twin)', bld: 'Gedung Nabire', daysOccupied: 24, occupancy: 80 },
    { room: 'Kamar B102 (Rombongan)', bld: 'Gedung Jayapura', daysOccupied: 22, occupancy: 73 },
    { room: 'Kamar A205 (VIP Suite)', bld: 'Gedung Nabire', daysOccupied: 20, occupancy: 67 },
  ];

  const handleDownloadDashboardPdf = async (openInNewTab = false) => {
    if (!dashboardRef.current) return;
    setIsGeneratingPdf(true);
    const filename = `Dashboard_Eksekutif_SIMAHA_${timeFilter}_${new Date().toISOString().split('T')[0]}`;
    try {
      await downloadElementAsPdf(dashboardRef.current, filename, {
        orientation: 'landscape',
        openInNewTab: openInNewTab,
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
                      ? 'bg-white text-emerald-900 shadow-xs'
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
            onClick={() => handleDownloadDashboardPdf(true)}
            disabled={isGeneratingPdf}
            icon={<Printer className="w-4 h-4 text-emerald-800" />}
            className="hidden sm:inline-flex bg-white"
          >
            Pratinjau PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleDownloadDashboardPdf(false)}
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
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{currentOccupancy}%</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> +6.2% vs target bulanan
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs bg-gradient-to-br from-emerald-50/50 to-amber-50/30">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
            <span>TOTAL PENERIMAAN (PNBP)</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-900 truncate">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1.5">Penerimaan resmi disetor ke kas</p>
        </div>
      </div>

      {/* Analytics Section 1: Financial & Occupancy Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Source */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Komposisi Penerimaan PNBP</h4>
          <p className="text-xs text-slate-500 mb-4">Berdasarkan unit layanan Asrama Haji Papua</p>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  dataKey="amount"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {revenueByCategory.map((entry, idx) => (
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
                {topRooms.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{r.room}</td>
                    <td className="py-3 px-3 text-slate-600">{r.bld}</td>
                    <td className="py-3 px-3 text-center font-semibold text-slate-800">{r.daysOccupied} Hari</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-700 h-full rounded-full"
                            style={{ width: `${r.occupancy}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 w-9 text-right">{r.occupancy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
