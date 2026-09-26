import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Plus, Search, Users, Calendar, 
  Phone, UserCheck, ArrowRight, Upload, FileSpreadsheet 
} from 'lucide-react';
import { db } from '../../db/database';
import { Group, Institution } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDateIndo } from '../../utils/formatters';

interface GroupsPageProps {
  onNavigate: (page: string, targetId?: string) => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    group_name: '',
    activity_name: '',
    institution_id: '',
    pic_name: '',
    pic_phone: '',
    pic_email: '',
    total_members: 30,
    male_count: 15,
    female_count: 15,
    checkin_date: '2026-09-27',
    checkout_date: '2026-09-30',
    notes: '',
  });

  const loadData = () => {
    setGroups(db.getGroups());
    setInstitutions(db.getInstitutions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.group_name || !formData.pic_name) {
      toast.error('Gagal', 'Nama rombongan dan nama PIC wajib diisi.');
      return;
    }

    const newGrp = db.saveGroup({
      group_name: formData.group_name,
      activity_name: formData.activity_name,
      institution_id: formData.institution_id || undefined,
      pic_name: formData.pic_name,
      pic_phone: formData.pic_phone,
      pic_email: formData.pic_email,
      total_members: Number(formData.total_members),
      male_count: Number(formData.male_count),
      female_count: Number(formData.female_count),
      checkin_date: formData.checkin_date,
      checkout_date: formData.checkout_date,
      notes: formData.notes,
    });

    toast.success('Rombongan Ditambahkan', `Rombongan ${newGrp.group_name} berhasil didaftarkan.`);
    setIsModalOpen(false);
    loadData();
  };

  const getInstitutionName = (id?: string) => {
    if (!id) return 'Mandiri';
    return institutions.find((i) => i.id === id)?.name || '-';
  };

  const filtered = groups.filter((g) => {
    return (
      g.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.pic_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-800" />
            Manajemen Rombongan & Jamaah Haji (Groups)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan kloter jamaah haji, rombongan manasik, peserta pelatihan dinas, dan penempatan massal.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Daftarkan Rombongan Baru
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama rombongan, nama agenda, PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Group Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((grp) => (
          <div
            key={grp.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {grp.total_members} Peserta ({grp.male_count}L / {grp.female_count}P)
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {formatDateIndo(grp.checkin_date)}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">{grp.group_name}</h3>
              <p className="text-xs text-emerald-800 font-medium truncate mb-3">{grp.activity_name}</p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <p><span className="text-slate-400">Instansi:</span> <span className="font-semibold text-slate-800">{getInstitutionName(grp.institution_id)}</span></p>
                <p><span className="text-slate-400">Koordinator/PIC:</span> <span className="font-bold text-slate-900">{grp.pic_name}</span> ({grp.pic_phone})</p>
                <p><span className="text-slate-400">Jadwal:</span> <span className="font-medium text-slate-800">{formatDateIndo(grp.checkin_date)} s/d {formatDateIndo(grp.checkout_date)}</span></p>
              </div>

              {grp.notes && (
                <p className="text-[11px] text-slate-500 italic mt-3 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  {grp.notes}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <Button
                size="sm"
                variant="primary"
                onClick={() => onNavigate('room-assignment')}
                className="w-full text-xs"
                icon={<UserCheck className="w-3.5 h-3.5" />}
              >
                Atur Penempatan Kamar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Rombongan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pendaftaran Rombongan Baru"
        subtitle="Sistem Penginapan Jamaah & Agenda Terpadu Papua"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Rombongan / Kloter *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Rombongan Jamaah Haji Kloter 2 Papua"
              value={formData.group_name}
              onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Agenda / Kegiatan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Pemantapan Ibadah Haji 1447 H"
              value={formData.activity_name}
              onChange={(e) => setFormData({ ...formData, activity_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Koordinator / PIC *</label>
              <input
                type="text"
                required
                placeholder="Nama PIC"
                value={formData.pic_name}
                onChange={(e) => setFormData({ ...formData, pic_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor HP / WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="0812-xxxx-xxxx"
                value={formData.pic_phone}
                onChange={(e) => setFormData({ ...formData, pic_phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Peserta *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.total_members}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setFormData({
                    ...formData,
                    total_members: val,
                    male_count: Math.ceil(val / 2),
                    female_count: Math.floor(val / 2),
                  });
                }}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Peserta Pria (L)</label>
              <input
                type="number"
                min="0"
                value={formData.male_count}
                onChange={(e) => setFormData({ ...formData, male_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Peserta Wanita (P)</label>
              <input
                type="number"
                min="0"
                value={formData.female_count}
                onChange={(e) => setFormData({ ...formData, female_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Masuk (Check-in) *</label>
              <input
                type="date"
                required
                value={formData.checkin_date}
                onChange={(e) => setFormData({ ...formData, checkin_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Keluar (Check-out) *</label>
              <input
                type="date"
                required
                value={formData.checkout_date}
                onChange={(e) => setFormData({ ...formData, checkout_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Data Rombongan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
