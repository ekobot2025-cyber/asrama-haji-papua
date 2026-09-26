import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Layers, BedDouble, Hotel, CheckCircle2 } from 'lucide-react';
import { db } from '../../db/database';
import { Building, Room } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const BuildingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    total_floors: 3,
    description: '',
  });

  const loadData = () => {
    setBuildings(db.getBuildings());
    setRooms(db.getRooms());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const newBld: Building = {
      id: `bld-${Date.now()}`,
      code: formData.code.toUpperCase(),
      name: formData.name,
      total_floors: Number(formData.total_floors),
      description: formData.description,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    const cur = db.getBuildings();
    cur.push(newBld);
    localStorage.setItem('sipah_buildings', JSON.stringify(cur));

    toast.success('Gedung Ditambahkan', `${newBld.name} berhasil disimpan.`);
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-800" />
            Master Gedung Asrama Haji
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data gedung akomodasi (Gedung Nabire, Jayapura, Merauke) dan zonasi penempatan jamaah.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Gedung Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buildings.map((b) => {
          const bRooms = rooms.filter((r) => r.building_id === b.id);
          const totalBeds = bRooms.reduce((acc, r) => acc + r.capacity, 0);

          return (
            <div
              key={b.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    KODE: {b.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{b.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{b.description}</p>

                <div className="grid grid-cols-3 gap-2 mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Lantai</span>
                    <span className="font-extrabold text-slate-800 text-sm">{b.total_floors}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Kamar</span>
                    <span className="font-extrabold text-slate-800 text-sm">{bRooms.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Kapasitas</span>
                    <span className="font-extrabold text-emerald-800 text-sm">{totalBeds} Bed</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Gedung Akomodasi Baru"
        maxWidth="md"
      >
        <form onSubmit={handleCreateBuilding} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kode Gedung *</label>
              <input
                type="text"
                required
                placeholder="GDD / GDE"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl uppercase font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Lantai *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.total_floors}
                onChange={(e) => setFormData({ ...formData, total_floors: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Gedung *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Gedung Biak Numfor / Gedung Timika"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Deskripsi & Peruntukan</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Gedung
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
