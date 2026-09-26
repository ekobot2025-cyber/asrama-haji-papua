import React, { useState, useEffect } from 'react';
import { 
  Wrench, Plus, Search, Filter, AlertTriangle, CheckCircle2, 
  Clock, ShieldAlert, DollarSign, RefreshCw 
} from 'lucide-react';
import { db } from '../../db/database';
import { MaintenanceRequest, Room, Facility } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateTimeIndo } from '../../utils/formatters';

export const MaintenancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // New Request Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    room_id: '',
    facility_id: '',
    issue_category: 'AC_HVAC' as const,
    priority: 'MEDIUM' as const,
    description: '',
    assigned_technician: 'Lukas Karoba (Teknisi)',
    estimated_cost: 150000,
  });

  // Complete Request Modal
  const [completeModal, setCompleteModal] = useState<{
    isOpen: boolean;
    request?: MaintenanceRequest;
    actualCost: number;
    completionNotes: string;
  }>({
    isOpen: false,
    actualCost: 0,
    completionNotes: '',
  });

  const loadData = () => {
    setRequests(db.getMaintenanceRequests());
    setRooms(db.getRooms());
    setFacilities(db.getFacilities());
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTargetName = (req: MaintenanceRequest) => {
    if (req.room_id) {
      const room = rooms.find((r) => r.id === req.room_id);
      return room ? `Kamar ${room.room_number}` : 'Kamar';
    }
    if (req.facility_id) {
      const fac = facilities.find((f) => f.id === req.facility_id);
      return fac ? fac.name : 'Fasilitas';
    }
    return 'Area Asrama Haji';
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.description) {
      toast.error('Gagal', 'Deskripsi kerusakan wajib diisi.');
      return;
    }

    const newReq = db.saveMaintenanceRequest(
      {
        room_id: formData.room_id || undefined,
        facility_id: formData.facility_id || undefined,
        issue_category: formData.issue_category,
        priority: formData.priority,
        description: formData.description,
        assigned_technician: formData.assigned_technician,
        estimated_cost: Number(formData.estimated_cost),
      },
      currentUser
    );

    toast.success('Laporan Dibuat', `Laporan kerusakan ${newReq.ticket_no} berhasil dicatat.`);
    setIsNewModalOpen(false);
    loadData();
  };

  const handleExecuteComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModal.request || !currentUser) return;

    const success = db.completeMaintenanceRequest(
      completeModal.request.id,
      completeModal.actualCost,
      completeModal.completionNotes,
      currentUser
    );

    if (success) {
      toast.success('Perbaikan Selesai', `Tiket ${completeModal.request.ticket_no} telah diselesaikan.`);
      setCompleteModal({ isOpen: false, actualCost: 0, completionNotes: '' });
      loadData();
    } else {
      toast.error('Gagal', 'Terjadi kesalahan saat menyelesaikan perbaikan.');
    }
  };

  const filtered = requests.filter((r) => {
    const target = getTargetName(r).toLowerCase();
    const matchSearch =
      r.ticket_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      target.includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-emerald-800" />
            Maintenance & Pemeliharaan Fasilitas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan kerusakan pendingin udara (AC), plumbing pipa, kelistrikan, dan pemeliharaan gedung asrama haji.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsNewModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Lapor Kerusakan Baru
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari tiket perbaikan, kamar, kerusakan..."
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
            <option value="all">Semua Status Tiket</option>
            <option value="OPEN">OPEN (Belum Dikerjakan)</option>
            <option value="IN_PROGRESS">IN PROGRESS (Dikerjakan)</option>
            <option value="COMPLETED">COMPLETED (Selesai)</option>
          </select>
        </div>
      </div>

      {/* Table Requests */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">No. Tiket</th>
                <th className="py-3 px-4">Lokasi / Kamar</th>
                <th className="py-3 px-4">Kategori & Prioritas</th>
                <th className="py-3 px-4">Deskripsi Kerusakan</th>
                <th className="py-3 px-4">Teknisi / Pelapor</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada laporan perbaikan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {req.ticket_no}
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">{formatDateTimeIndo(req.reported_at)}</p>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {getTargetName(req)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">{req.issue_category}</span>
                        <Badge status={req.priority} size="sm" />
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-[240px]">
                      <p className="truncate">{req.description}</p>
                      {req.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">{req.notes}</p>}
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      <p className="font-semibold">{req.assigned_technician || 'Belum Ditugaskan'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Pelapor: {req.reporter_name}</p>
                    </td>

                    <td className="py-3 px-4">
                      <Badge status={req.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      {req.status !== 'COMPLETED' ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setCompleteModal({ isOpen: true, request: req, actualCost: req.estimated_cost || 0, completionNotes: 'Perbaikan selesai dan berfungsi normal' })}
                          className="text-[11px] py-1"
                        >
                          Selesaikan
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lapor Kerusakan Baru */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Form Laporan Kerusakan Fasilitas"
        subtitle="Sistem Maintenance UPT Asrama Haji Papua"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Kamar Rusak</label>
              <select
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value, facility_id: '' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="">-- Bukan Kamar / Umum --</option>
                {rooms.map((rm) => (
                  <option key={rm.id} value={rm.id}>Kamar {rm.room_number}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Atau Fasilitas Umum</label>
              <select
                value={formData.facility_id}
                onChange={(e) => setFormData({ ...formData, facility_id: e.target.value, room_id: '' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="">-- Bukan Fasilitas Umum --</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Masalah *</label>
              <select
                value={formData.issue_category}
                onChange={(e) => setFormData({ ...formData, issue_category: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
              >
                <option value="AC_HVAC">AC & Pendingin Ruangan</option>
                <option value="PLUMBING">Pipa Air & Sanitasi (Plumbing)</option>
                <option value="ELECTRICAL">Kelistrikan & Lampu</option>
                <option value="FURNITURE">Mebel & Tempat Tidur</option>
                <option value="CIVIL">Dinding, Pintu & Jendela</option>
                <option value="OTHER">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tingkat Prioritas *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold"
              >
                <option value="LOW">LOW (Bisa Ditunda)</option>
                <option value="MEDIUM">MEDIUM (Standar)</option>
                <option value="HIGH">HIGH (Penting)</option>
                <option value="URGENT">URGENT (Kamar Otomatis Nonaktif)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Rincian Deskripsi Kerusakan *</label>
            <textarea
              rows={3}
              required
              placeholder="Jelaskan detail letak kerusakan dan dampaknya..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Teknisi Ditugaskan</label>
              <input
                type="text"
                value={formData.assigned_technician}
                onChange={(e) => setFormData({ ...formData, assigned_technician: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Estimasi Biaya Suku Cadang (Rp)</label>
              <input
                type="number"
                step="50000"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsNewModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Kirim Tiket Perbaikan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Selesaikan Perbaikan */}
      {completeModal.request && (
        <Modal
          isOpen={completeModal.isOpen}
          onClose={() => setCompleteModal({ ...completeModal, isOpen: false })}
          title={`Penyelesaian Tiket ${completeModal.request.ticket_no}`}
          subtitle={getTargetName(completeModal.request)}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteComplete} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-900">{completeModal.request.description}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Kategori: {completeModal.request.issue_category} &bull; Prioritas: {completeModal.request.priority}
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Biaya Riil Perbaikan (Rp) *</label>
              <input
                type="number"
                step="10000"
                required
                value={completeModal.actualCost}
                onChange={(e) => setCompleteModal({ ...completeModal, actualCost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Hasil Pengerjaan Teknisi *</label>
              <textarea
                rows={3}
                required
                value={completeModal.completionNotes}
                onChange={(e) => setCompleteModal({ ...completeModal, completionNotes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setCompleteModal({ ...completeModal, isOpen: false })}>
                Batal
              </Button>
              <Button variant="primary" type="submit" icon={<CheckCircle2 className="w-4 h-4" />}>
                Konfirmasi Perbaikan Selesai
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
