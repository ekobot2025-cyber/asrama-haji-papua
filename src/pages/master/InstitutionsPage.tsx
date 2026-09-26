import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Search, Phone, Mail, MapPin } from 'lucide-react';
import { db } from '../../db/database';
import { Institution } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const InstitutionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'KEMENAG' as const,
    address: '',
    phone: '',
    contact_person: '',
    email: '',
  });

  const loadData = () => {
    setInstitutions(db.getInstitutions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newInst: Institution = {
      id: `inst-${Date.now()}`,
      name: formData.name,
      type: formData.type,
      address: formData.address,
      phone: formData.phone,
      contact_person: formData.contact_person,
      email: formData.email,
    };

    const cur = db.getInstitutions();
    cur.push(newInst);
    localStorage.setItem('sipah_institutions', JSON.stringify(cur));

    toast.success('Instansi Tersimpan', `${newInst.name} berhasil ditambahkan.`);
    setIsModalOpen(false);
    loadData();
  };

  const filtered = institutions.filter((i) => {
    return (
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.contact_person.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-800" />
            Master Instansi & Lembaga Rekanan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data kementerian, dinas, pemda kabupaten/kota se-Papua, ormas Islam, dan KBIHU.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Instansi Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((inst) => (
          <div
            key={inst.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow text-xs"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mb-2">
                {inst.type}
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">{inst.name}</h3>

              <div className="space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{inst.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{inst.phone}</span>
                </p>
                <p className="text-slate-800 font-semibold pt-1 border-t border-slate-200/60">
                  PIC: {inst.contact_person}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Instansi / Lembaga Baru"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Instansi *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kantor Kemenag Kabupaten Keerom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Instansi *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="KEMENAG">Kementerian Agama</option>
                <option value="PEMDA">Pemerintah Daerah (Pemda)</option>
                <option value="DINAS">Dinas Teknis / BPMP</option>
                <option value="KOMUNITAS">KBIHU / Ormas Islam</option>
                <option value="SWASTA">BUMN / Swasta</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor Telepon Kantor *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab (PIC & No HP) *</label>
            <input
              type="text"
              required
              placeholder="Contoh: H. Rusli (0812-xxxx-xxxx)"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alamat Kantor</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Instansi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
