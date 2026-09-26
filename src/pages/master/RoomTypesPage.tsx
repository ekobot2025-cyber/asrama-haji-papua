import React, { useState, useEffect } from 'react';
import { BedDouble, Plus, Search, CheckCircle2 } from 'lucide-react';
import { db } from '../../db/database';
import { RoomType } from '../../types';
import { Button } from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';

export const RoomTypesPage: React.FC = () => {
  const [types, setTypes] = useState<RoomType[]>([]);

  useEffect(() => {
    setTypes(db.getRoomTypes());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-emerald-800" />
            Master Jenis Kamar (Room Types)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kategori tipe kamar: Standard Quad (4 Bed), VIP Twin (2 Bed), Rombongan (6 Bed), dan VIP Suite.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {types.map((t) => (
          <div
            key={t.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {t.code}
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  Kapasitas: {t.default_capacity} Bed
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{t.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{t.description}</p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs mb-4">
                <span className="text-slate-500">Tarif Standar Acuan:</span>
                <span className="font-black font-mono text-emerald-900 text-sm">
                  {formatCurrency(t.base_rate_per_night)} / malam
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Fasilitas Bawaan:
                </span>
                <div className="flex flex-wrap gap-1">
                  {t.amenities.map((item, idx) => (
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
