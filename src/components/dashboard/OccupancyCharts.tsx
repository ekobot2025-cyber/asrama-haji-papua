import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { Room } from '../../types';

interface OccupancyChartsProps {
  rooms: Room[];
}

export const OccupancyCharts: React.FC<OccupancyChartsProps> = ({ rooms }) => {
  // 1. Calculate Room Status breakdown from database
  const statusCounts = rooms.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Available', value: statusCounts['AVAILABLE'] || 0, color: '#c9a961' },
    { name: 'Occupied', value: statusCounts['OCCUPIED'] || 0, color: '#2563eb' },
    { name: 'Reserved', value: statusCounts['RESERVED'] || 0, color: '#d4af37' },
    { name: 'Cleaning', value: statusCounts['CLEANING'] || 0, color: '#ea580c' },
    { name: 'Maintenance', value: statusCounts['MAINTENANCE'] || 0, color: '#e11d48' },
  ];

  // 2. Trend 7 Days Occupancy (Realistic trend matching current week)
  const sevenDaysData = [
    { day: 'Sen, 20/9', occupancy: 42, beds: 42 },
    { day: 'Sel, 21/9', occupancy: 48, beds: 48 },
    { day: 'Rab, 22/9', occupancy: 55, beds: 55 },
    { day: 'Kam, 23/9', occupancy: 62, beds: 62 },
    { day: 'Jum, 24/9', occupancy: 68, beds: 68 },
    { day: 'Sab, 25/9', occupancy: 78, beds: 78 },
    { day: 'Min, 26/9', occupancy: 82, beds: 82 },
  ];

  // 3. Monthly Occupancy Trend 2026
  const monthlyData = [
    { month: 'Apr', tamu: 210, okupansi: 52 },
    { month: 'Mei', tamu: 340, okupansi: 68 },
    { month: 'Jun', tamu: 480, okupansi: 85 }, // Musim Haji
    { month: 'Jul', tamu: 390, okupansi: 74 },
    { month: 'Agu', tamu: 280, okupansi: 60 },
    { month: 'Sep', tamu: 365, okupansi: 79 },
  ];

  // 4. Breakdown by Activity/Guest Type
  const guestTypeData = [
    { name: 'Jamaah Haji', count: 185, fill: '#c9a961' },
    { name: 'Kedinasan', count: 95, fill: '#1d4ed8' },
    { name: 'Manasik', count: 68, fill: '#d4af37' },
    { name: 'Pelatihan', count: 52, fill: '#7c3aed' },
    { name: 'Umum', count: 28, fill: '#8a6d2b' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 7-Days Trend Area Chart */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Tren Okupansi Tempat Tidur (7 Hari Terakhir)</h4>
            <p className="text-xs text-slate-500">Persentase tingkat hunian asrama haji Jayapura</p>
          </div>
          <span className="text-xs font-bold text-[#8a6d2b] bg-[#fbf8ee] px-3 py-1 rounded-full border border-[#e8dfc8] shadow-2xs">
            Rata-rata 62.1%
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sevenDaysData}>
              <defs>
                <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c9a961" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#c9a961" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                formatter={(val: number) => [`${val}%`, 'Tingkat Okupansi']} 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="occupancy" stroke="#c9a961" strokeWidth={3} fillOpacity={1} fill="url(#colorOcc)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Status Composition Donut Chart */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Komposisi Status Kamar Real-time</h4>
            <p className="text-xs text-slate-500">Total {rooms.length} kamar terdistribusi di 3 gedung</p>
          </div>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val: number, name: string) => [`${val} Kamar`, name]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Tamu & Okupansi Bar Chart */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Okupansi Bulanan & Jumlah Tamu (Tahun 2026)</h4>
            <p className="text-xs text-slate-500">Histori okupansi per bulan di Asrama Haji Papua</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis unit="%" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip 
                formatter={(val: number, name: string) => [name === 'okupansi' ? `${val}%` : `${val} Orang`, name === 'okupansi' ? 'Okupansi' : 'Total Tamu']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="okupansi" fill="#C59B27" radius={[8, 8, 0, 0]} name="Okupansi (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Breakdown Chart */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Distribusi Tamu Berdasarkan Jenis Kegiatan</h4>
            <p className="text-xs text-slate-500">Kategori penerima manfaat fasilitas asrama haji</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={guestTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip 
                formatter={(val: number) => [`${val} Tamu`, 'Jumlah']}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {guestTypeData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
