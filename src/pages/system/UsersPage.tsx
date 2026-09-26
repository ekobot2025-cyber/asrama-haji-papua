import React, { useState, useEffect } from 'react';
import { UserCog, Plus, Shield, CheckCircle2, Lock } from 'lucide-react';
import { db } from '../../db/database';
import { User, UserRole } from '../../types';
import { Badge } from '../../components/common/Badge';
import { formatDateTimeIndo } from '../../utils/formatters';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(db.getUsers());
  }, []);

  const roleDescriptions: Record<UserRole, string> = {
    SUPER_ADMIN: 'Akses penuh ke seluruh konfigurasi sistem, database, audit log, dan master data.',
    ADMIN_PENGINAPAN: 'Kelola reservasi, alokasi kamar, verifikasi tamu, dan monitoring operasional.',
    PETUGAS: 'Front desk: proses reservasi harian, check-in, check-out, serah terima kunci kartu.',
    KEUANGAN: 'Penerbitan invoice tagihan, penerimaan pembayaran kasir, pencetakan kwitansi & laporan PNBP.',
    HOUSEKEEPING: 'Pembaruan status kebersihan kamar (Dirty, Cleaning, Inspected, Ready).',
    PIMPINAN: 'Hak akses Executive Dashboard dan laporan operasional menyeluruh (Read-only).',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-emerald-800" />
            Manajemen Pengguna & Hak Akses (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengaturan peran pengguna dan hak akses granular petugas UPT Asrama Haji Provinsi Papua.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((u) => (
          <div
            key={u.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow text-xs"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] text-slate-400">@{u.username}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> {u.status}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-900 truncate text-sm">{u.name}</h3>
                  <p className="text-slate-500 truncate text-[11px]">{u.email}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Peran / Role:</span>
                  <span className="font-bold text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded">
                    {u.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {roleDescriptions[u.role]}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Login Terakhir:</span>
              <span className="font-medium text-slate-600">
                {u.last_login ? formatDateTimeIndo(u.last_login) : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
