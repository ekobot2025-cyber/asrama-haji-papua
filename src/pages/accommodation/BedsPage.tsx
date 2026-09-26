import React, { useState, useEffect } from 'react';
import { Layers, Search, Filter, BedDouble, CheckCircle2 } from 'lucide-react';
import { db } from '../../db/database';
import { Bed, Room } from '../../types';
import { Badge } from '../../components/common/Badge';

export const BedsPage: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setBeds(db.getBeds());
    setRooms(db.getRooms());
  }, []);

  const getRoomNumber = (roomId: string) => rooms.find((r) => r.id === roomId)?.room_number || '-';

  const filtered = beds.filter((b) => {
    const matchSearch =
      b.bed_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRoomNumber(b.room_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-800" />
            Manajemen Tempat Tidur Individual (Bed)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Asrama Haji berbasis kapasitas tempat tidur individual per kamar (A101-B01, A101-B02, dst).
          </p>
        </div>

        <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
          Total Terdaftar: {beds.length} Bed
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kode bed, nomor kamar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="all">Semua Status Bed</option>
            <option value="AVAILABLE">AVAILABLE (Kosong)</option>
            <option value="OCCUPIED">OCCUPIED (Terisi)</option>
            <option value="RESERVED">RESERVED (Dipesan)</option>
            <option value="MAINTENANCE">MAINTENANCE (Rusak)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-slate-900">{b.bed_code}</span>
                <span className={`w-2 h-2 rounded-full ${
                  b.status === 'AVAILABLE' ? 'bg-emerald-500' :
                  b.status === 'OCCUPIED' ? 'bg-blue-600' :
                  b.status === 'RESERVED' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
              </div>
              <p className="text-[11px] text-slate-500">Kamar {getRoomNumber(b.room_id)}</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <Badge status={b.status} size="sm" showDot={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
