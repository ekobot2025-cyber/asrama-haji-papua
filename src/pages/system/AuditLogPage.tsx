import React, { useState, useEffect } from 'react';
import { History, Search, Shield, Filter, AlertCircle } from 'lucide-react';
import { db } from '../../db/database';
import { AuditLog } from '../../types';
import { formatDateTimeIndo } from '../../utils/formatters';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    setLogs(db.getAuditLogs());
  }, []);

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.target_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchMod = moduleFilter === 'all' || l.module === moduleFilter;
    return matchSearch && matchMod;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#8a6d2b]" />
            Audit Log Sistem & Rekam Jejak Aktivitas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak kepatuhan dan integritas data pemerintah: mencatat setiap mutasi status reservasi, keuangan, dan kamar.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900">
          <Shield className="w-4 h-4 text-amber-700" />
          <span className="font-semibold">Log Bersifat Permanen (Immutable)</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari user, uraian mutasi data, nomor dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-white"
          >
            <option value="all">Semua Modul</option>
            <option value="Reservasi">Reservasi</option>
            <option value="Check-in">Check-in</option>
            <option value="Check-out">Check-out</option>
            <option value="Keuangan">Keuangan & Pembayaran</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Penempatan Kamar">Penempatan Kamar</option>
            <option value="Sistem">Sistem</option>
          </select>
        </div>
      </div>

      {/* Table Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Waktu (WIT)</th>
                <th className="py-3 px-4">Pengguna (User)</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Modul</th>
                <th className="py-3 px-4">Jenis Aksi</th>
                <th className="py-3 px-4">Rincian Aktivitas Data</th>
                <th className="py-3 px-4 text-right">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {formatDateTimeIndo(log.timestamp)}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                    {log.user_name}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {log.user_role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#8a6d2b] font-sans">
                    {log.module}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-700">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-sans max-w-[320px]">
                    <p className="leading-relaxed">{log.details}</p>
                    {log.target_id && (
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        Target Ref: {log.target_id}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
