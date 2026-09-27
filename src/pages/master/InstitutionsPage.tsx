import React, { useState, useEffect } from 'react';
import { Landmark, Plus, Search, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import { db } from '../../db/database';
import { Institution } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const InstitutionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'KEMENAG' as Institution['type'],
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

  const handleOpenModal = (inst?: Institution) => {
    if (inst) {
      setEditingInstitution(inst);
      setFormData({
        name: inst.name,
        type: inst.type,
        address: inst.address,
        phone: inst.phone,
        contact_person: inst.contact_person,
        email: inst.email || '',
      });
    } else {
      setEditingInstitution(null);
      setFormData({
        name: '',
        type: 'KEMENAG',
        address: '',
        phone: '',
        contact_person: '',
        email: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Gagal', 'Nama instansi wajib diisi.');
      return;
    }

    db.saveInstitution({
      id: editingInstitution?.id,
      name: formData.name,
      type: formData.type,
      address: formData.address,
      phone: formData.phone,
      contact_person: formData.contact_person,
      email: formData.email,
    }, currentUser || undefined);

    toast.success(
      editingInstitution ? 'Instansi Diperbarui' : 'Instansi Tersimpan',
      `${formData.name} berhasil disimpan.`
    );
    setIsModalOpen(false);
    loadData();
  };

  const isHousekeeping = currentUser?.role === 'HOUSEKEEPING';

  const handleDelete = () => {
    if (isHousekeeping) {
      toast.error('Akses Ditolak', 'Petugas Housekeeping tidak diizinkan menghapus data instansi.');
      setDeleteTarget(null);
      return;
    }

    if (!deleteTarget) return;

    const res = db.deleteInstitution(deleteTarget.id, currentUser || undefined);
    if (res.success) {
      toast.success('Instansi Dihapus', res.message);
      setDeleteTarget(null);
      loadData();
    } else {
      toast.error('Gagal Menghapus', res.message);
      setDeleteTarget(null);
    }
  };

  const filtered = institutions.filter((i) => {
    return (
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-[#8a6d2b]" />
            Master Instansi & Lembaga Rekanan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data kementerian, dinas, pemda kabupaten/kota se-Papua, ormas Islam, BUMN, dan KBIHU rekanan.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Instansi Baru
        </Button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama instansi, kontak person, alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((inst) => (
          <div
            key={inst.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow text-xs group"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a6d2b] bg-[#fbf8ee] px-2.5 py-0.5 rounded-full border border-[#e8dfc8] inline-block mb-2">
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
                {inst.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{inst.email}</span>
                  </p>
                )}
                <p className="text-slate-800 font-semibold pt-1 border-t border-slate-200/60">
                  PIC: {inst.contact_person}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleOpenModal(inst)}
                icon={<Edit className="w-3.5 h-3.5 text-slate-600" />}
              >
                Edit Instansi
              </Button>
              {!isHousekeeping && (
                <button
                  onClick={() => setDeleteTarget(inst)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                  title="Hapus Instansi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah / Edit Instansi */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInstitution ? `Edit Instansi: ${editingInstitution.name}` : 'Tambah Instansi / Lembaga Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Instansi *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Kantor Kemenag Kabupaten Keerom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Instansi *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#c9a961]"
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
                placeholder="0967-xxxxxx atau 0812-xxxx-xxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Penanggung Jawab (PIC) *</label>
              <input
                type="text"
                required
                placeholder="Nama PIC / Kasubbag TU"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi (Opsional)</label>
              <input
                type="email"
                placeholder="instansi@kemenag.go.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alamat Kantor</label>
            <input
              type="text"
              placeholder="Jalan, Distrik, Kabupaten / Kota"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              {editingInstitution ? 'Simpan Perubahan' : 'Simpan Instansi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Master Instansi"
        message={`Apakah Anda yakin ingin menghapus data instansi "${deleteTarget?.name}"?`}
        confirmText="Hapus Instansi"
        variant="danger"
      />
    </div>
  );
};
