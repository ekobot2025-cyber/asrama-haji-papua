import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Search, Users, MapPin, CheckCircle2 } from 'lucide-react';
import { db } from '../../db/database';
import { Facility } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatCurrency } from '../../utils/formatters';

export const FacilitiesPage: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFacilities(db.getFacilities());
  }, []);

  const filtered = facilities.filter((f) => {
    return (
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-800" />
            Fasilitas Umum & Ruang Pertemuan (Aula)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aula Utama Cenderawasih, Ruang Pertemuan Asmat, Masjid Baiturrahim, Lapangan Manasik Haji, dan Dapur Umum.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((fac) => (
          <div
            key={fac.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {fac.type.replace(/_/g, ' ')}
                </span>
                <Badge status={fac.status} size="sm" />
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">{fac.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {fac.location}
              </p>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">{fac.description}</p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Kapasitas</span>
                  <span className="font-bold text-slate-800">{fac.capacity} Orang</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tarif Harian</span>
                  <span className="font-mono font-black text-emerald-900 text-sm">
                    {fac.daily_rate > 0 ? formatCurrency(fac.daily_rate) : 'Gratis'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Fasilitas & Kelengkapan:
                </span>
                <div className="flex flex-wrap gap-1">
                  {fac.amenities.map((item, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
