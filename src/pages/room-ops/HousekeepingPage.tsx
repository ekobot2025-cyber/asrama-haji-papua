import React, { useState, useEffect } from 'react';
import { 
  Sparkles, CheckCircle2, Clock, Search, Filter, 
  RotateCw, RefreshCw, UserCheck, ShieldCheck, Edit, AlertTriangle
} from 'lucide-react';
import { db } from '../../db/database';
import { HousekeepingTask, Room, HousekeepingStatus, RoomStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDateTimeIndo } from '../../utils/formatters';

export const HousekeepingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Action Modal
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [newStatus, setNewStatus] = useState<HousekeepingStatus>('IN_CLEANING');
  const [roomConditionStatus, setRoomConditionStatus] = useState<RoomStatus>('CLEANING');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = () => {
    setTasks(db.getHousekeepingTasks());
    setRooms(db.getRooms());
  };

  useEffect(() => {
    loadData();
  }, []);

  const getRoomNumber = (roomId: string) => {
    return rooms.find((r) => r.id === roomId)?.room_number || roomId;
  };

  const getRoom = (roomId: string) => {
    return rooms.find((r) => r.id === roomId);
  };

  const handleOpenActionModal = (task: HousekeepingTask, targetStatus?: HousekeepingStatus) => {
    setSelectedTask(task);
    const room = rooms.find(r => r.id === task.room_id);
    
    // Default next status if not specified
    const nextHkStatus = targetStatus || (
      task.status === 'DIRTY' ? 'IN_CLEANING' :
      task.status === 'IN_CLEANING' ? 'INSPECTED' :
      task.status === 'INSPECTED' ? 'READY' : task.status
    );

    setNewStatus(nextHkStatus);
    setTaskNotes(task.notes || room?.notes || '');
    setAssignedStaff(task.assigned_to || currentUser?.name || 'Petugas Housekeeping');
    
    // Auto sync room condition status
    if (nextHkStatus === 'READY') {
      setRoomConditionStatus('AVAILABLE');
    } else if (nextHkStatus === 'DIRTY' || nextHkStatus === 'IN_CLEANING') {
      setRoomConditionStatus(room?.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'CLEANING');
    } else {
      setRoomConditionStatus(room?.status || 'CLEANING');
    }

    setIsModalOpen(true);
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !currentUser) return;

    // Harmonize final room status
    const finalRoomStatus: RoomStatus = 
      newStatus === 'READY' && roomConditionStatus === 'CLEANING'
        ? 'AVAILABLE'
        : roomConditionStatus;

    const success = db.updateHousekeepingTask(
      selectedTask.id,
      newStatus,
      currentUser,
      taskNotes,
      finalRoomStatus,
      assignedStaff
    );

    if (success) {
      toast.success(
        'Kondisi & Status Kamar Diperbarui',
        `Kamar ${getRoomNumber(selectedTask.room_id)}: Kebersihan [${newStatus}] | Kondisi Fisik [${finalRoomStatus}].`
      );
      setIsModalOpen(false);
      loadData();
    } else {
      toast.error('Gagal', 'Terjadi kesalahan saat memperbarui status.');
    }
  };

  // Filter tasks
  const filtered = tasks.filter((t) => {
    const roomNum = getRoomNumber(t.room_id);
    const matchSearch = roomNum.toLowerCase().includes(searchTerm.toLowerCase()) || (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary counts
  const dirtyCount = tasks.filter((t) => t.status === 'DIRTY').length;
  const inCleaningCount = tasks.filter((t) => t.status === 'IN_CLEANING').length;
  const inspectedCount = tasks.filter((t) => t.status === 'INSPECTED').length;
  const readyCount = tasks.filter((t) => t.status === 'READY').length;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#8a6d2b]" />
            Housekeeping & Tata Graha Kamar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Alur operasional kebersihan kamar: Checkout &rarr; Dirty &rarr; In Cleaning &rarr; Inspected &rarr; Ready &rarr; Available.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadData}
          icon={<RefreshCw className="w-4 h-4 text-[#8a6d2b]" />}
        >
          Muat Ulang
        </Button>
      </div>

      {/* Workflow Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-orange-700 uppercase">1. Dirty (Kotor)</p>
            <p className="text-2xl font-black text-orange-900">{dirtyCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-orange-500" />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-blue-700 uppercase">2. In Cleaning (Dibersihkan)</p>
            <p className="text-2xl font-black text-blue-900">{inCleaningCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-blue-500" />
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-amber-700 uppercase">3. Inspected (Diinspeksi)</p>
            <p className="text-2xl font-black text-amber-900">{inspectedCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-amber-500" />
        </div>

        <div className="p-4 bg-[#fbf8ee] border border-[#e8dfc8] rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#8a6d2b] uppercase">4. Ready (Siap Pakai)</p>
            <p className="text-2xl font-black text-[#8a6d2b]">{readyCount}</p>
          </div>
          <span className="w-3 h-3 rounded-full bg-[#fbf8ee]0" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor kamar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-slate-50/50"
            />
          </div>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961] bg-white"
          >
            <option value="all">Semua Status Kebersihan</option>
            <option value="DIRTY">DIRTY</option>
            <option value="IN_CLEANING">IN CLEANING</option>
            <option value="INSPECTED">INSPECTED</option>
            <option value="READY">READY</option>
          </select>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Kamar</th>
                <th className="py-3 px-4">Jenis Tugas</th>
                <th className="py-3 px-4">Status Kebersihan</th>
                <th className="py-3 px-4">Petugas Kebersihan</th>
                <th className="py-3 px-4">Waktu Mulai</th>
                <th className="py-3 px-4">Catatan / Kondisi</th>
                <th className="py-3 px-4 text-right">Aksi Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada tugas housekeeping yang sesuai filter saat ini.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const roomNum = getRoomNumber(t.room_id);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        Kamar {roomNum}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {t.task_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={t.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">
                        {t.assigned_to || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {t.started_at ? formatDateTimeIndo(t.started_at) : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[220px] truncate">
                        {t.notes || t.room_condition || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Workflow Progression */}
                          {t.status === 'DIRTY' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleOpenActionModal(t, 'IN_CLEANING')}
                              className="text-[11px] py-1 font-bold"
                            >
                              Mulai Bersihkan
                            </Button>
                          )}
                          {t.status === 'IN_CLEANING' && (
                            <Button
                              size="sm"
                              variant="amber"
                              onClick={() => handleOpenActionModal(t, 'INSPECTED')}
                              className="text-[11px] py-1 font-bold"
                            >
                              Inspeksi
                            </Button>
                          )}
                          {t.status === 'INSPECTED' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleOpenActionModal(t, 'READY')}
                              className="text-[11px] py-1 font-bold"
                            >
                              Set Ready (Available)
                            </Button>
                          )}
                          {t.status === 'READY' && (
                            <button
                              onClick={() => handleOpenActionModal(t, 'DIRTY')}
                              className="text-[11px] px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 transition-colors"
                              title="Tandai kamar kotor / perlu dibersihkan kembali"
                            >
                              Set Kotor
                            </button>
                          )}

                          {/* Dedicated Edit Kondisi Button */}
                          <button
                            onClick={() => handleOpenActionModal(t, t.status)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#8a6d2b] hover:bg-[#fbf8ee] hover:border-[#c9a961] transition-colors"
                            title="Edit Kondisi & Status Kamar"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Update Status & Kondisi Housekeeping */}
      {selectedTask && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Update Kondisi & Kebersihan: Kamar ${getRoomNumber(selectedTask.room_id)}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            {/* Header info room & current status */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Kamar Target</span>
                <span className="font-extrabold text-slate-900 text-sm">Kamar {getRoomNumber(selectedTask.room_id)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Status Kebersihan Saat Ini</span>
                <Badge status={selectedTask.status} size="sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Kebersihan Baru *</label>
                <select
                  value={newStatus}
                  onChange={(e) => {
                    const val = e.target.value as HousekeepingStatus;
                    setNewStatus(val);
                    if (val === 'READY') {
                      setRoomConditionStatus('AVAILABLE');
                    } else if (val === 'DIRTY' || val === 'IN_CLEANING') {
                      if (roomConditionStatus === 'AVAILABLE') {
                        setRoomConditionStatus('CLEANING');
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold focus:ring-2 focus:ring-[#c9a961]"
                >
                  <option value="DIRTY">DIRTY (Kotor / Perlu Dikerjakan)</option>
                  <option value="IN_CLEANING">IN CLEANING (Sedang Dibersihkan)</option>
                  <option value="INSPECTED">INSPECTED (Telah Diinspeksi)</option>
                  <option value="READY">READY (Selesai & Siap Huni)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kondisi Fisik Kamar *</label>
                <select
                  value={roomConditionStatus}
                  onChange={(e) => setRoomConditionStatus(e.target.value as RoomStatus)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold focus:ring-2 focus:ring-[#c9a961]"
                >
                  <option value="AVAILABLE">AVAILABLE (Tersedia / Siap Huni)</option>
                  <option value="CLEANING">CLEANING (Dalam Pembersihan)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Kerusakan / Perbaikan)</option>
                  <option value="OCCUPIED">OCCUPIED (Sedang Dihuni Tamu)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Petugas Kebersihan / Pemeriksa</label>
              <input
                type="text"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                placeholder="Nama petugas housekeeping yang bertugas"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-semibold focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Kondisi Fisik & Hasil Kebersihan</label>
              <textarea
                rows={3}
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Contoh: Sprei dan sarung bantal telah diganti baru, kamar mandi disanitasi, pewangi ruangan dipasang, AC dingin normal..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#c9a961]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan & Terapkan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
