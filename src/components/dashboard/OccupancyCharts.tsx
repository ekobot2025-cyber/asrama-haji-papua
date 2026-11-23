import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { Room, Bed, Reservation } from '../../types';

interface OccupancyChartsProps {
  rooms: Room[];
  beds?: Bed[];
  reservations?: Reservation[];
}

export const OccupancyCharts: React.FC<OccupancyChartsProps> = ({ 
  rooms, 
  beds = [], 
  reservations = [] 
}) => {
  // 1. Calculate Room Status breakdown from actual rooms in database
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
    { name: 'Inactive', value: statusCounts['INACTIVE'] || 0, color: '#94a3b8' },
  ].filter(item => item.value > 0);

  // 2. Trend 7 Days Occupancy calculated dynamically from real reservations & beds
  const totalBedsCount = beds.length > 0 ? beds.length : (rooms.length * 2);
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const sevenDaysData = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = `${dayNames[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;

    let occupiedBedsCount = 0;
    reservations.forEach(r => {
      if (
        (r.status === 'CHECKED_IN' || r.status === 'CONFIRMED') &&
        r.checkin_date <= dateStr &&
        r.checkout_date >= dateStr
      ) {
        occupiedBedsCount += r.total_guests || r.total_rooms_requested || 1;
      }
    });

    const occRate = totalBedsCount > 0 
      ? Math.min(100, Math.round((occupiedBedsCount / totalBedsCount) * 100)) 
      : 0;

    sevenDaysData.push({
      day: dayLabel,
      occupancy: occRate,
      beds: occupiedBedsCount
    });
  }

  const avgOccupancy = sevenDaysData.length > 0
    ? (sevenDaysData.reduce((sum, d) => sum + d.occupancy, 0) / sevenDaysData.length).toFixed(1)
    : '0.0';

  // 3. Monthly Occupancy Trend 2026 based on real reservations
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const currentMonthIdx = now.getMonth();
  const startIdx = Math.max(0, currentMonthIdx - 5);
  const windowMonths = months.slice(startIdx, Math.max(startIdx + 6, currentMonthIdx + 1));

  const monthlyData = windowMonths.map(month => {
    const mIdx = months.indexOf(month);
    const mStr = String(mIdx + 1).padStart(2, '0');
    const yearMonth = `2026-${mStr}`;

    let tamuCount = 0;
    reservations.forEach(r => {
      if (
        r.status !== 'CANCELLED' && 
        r.status !== 'REJECTED' &&
        r.checkin_date && 
        r.checkin_date.startsWith(yearMonth)
      ) {
        tamuCount += r.total_guests || 1;
      }
    });

    const monthlyCapacity = totalBedsCount * 30;
    const okupansi = monthlyCapacity > 0 
      ? Math.min(100, Math.round((tamuCount / monthlyCapacity) * 100)) 
      : 0;

    return {
      month,
      tamu: tamuCount,
      okupansi,
    };
  });

  // 4. Breakdown by Activity/Guest Type from real reservations
  const categoryCounts: Record<string, number> = {
    'Jamaah Haji': 0,
    'Kedinasan': 0,
    'Manasik': 0,
    'Pelatihan': 0,
    'Umum': 0,
  };

  reservations.forEach(r => {
    if (r.status === 'CANCELLED' || r.status === 'REJECTED') return;
    const guests = r.total_guests || 1;
    const act = (r.activity_name || '').toLowerCase();
    const pkg = (r.package_type || '').toLowerCase();
    const type = (r.reservation_type || '').toLowerCase();

    if (act.includes('haji') || pkg.includes('haji') || act.includes('kloter')) {
      categoryCounts['Jamaah Haji'] += guests;
    } else if (act.includes('manasik') || pkg.includes('manasik')) {
      categoryCounts['Manasik'] += guests;
    } else if (act.includes('diklat') || pkg.includes('diklat') || act.includes('bimtek') || act.includes('pelatihan')) {
      categoryCounts['Pelatihan'] += guests;
    } else if (type === 'instansi' || act.includes('dinas') || act.includes('kemenag') || act.includes('rapat')) {
      categoryCounts['Kedinasan'] += guests;
    } else {
      categoryCounts['Umum'] += guests;
    }
  });

  const guestTypeData = [
    { name: 'Jamaah Haji', count: categoryCounts['Jamaah Haji'], fill: '#c9a961' },
    { name: 'Kedinasan', count: categoryCounts['Kedinasan'], fill: '#1d4ed8' },
    { name: 'Manasik', count: categoryCounts['Manasik'], fill: '#d4af37' },
    { name: 'Pelatihan', count: categoryCounts['Pelatihan'], fill: '#7c3aed' },
    { name: 'Umum', count: categoryCounts['Umum'], fill: '#8a6d2b' },
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
            Rata-rata {avgOccupancy}%
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
            <p className="text-xs text-slate-500">Total {rooms.length} kamar (Gedung Madinah Lt. 1 & 2)</p>
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
