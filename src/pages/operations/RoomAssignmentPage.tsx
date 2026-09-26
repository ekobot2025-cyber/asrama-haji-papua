import React, { useState, useEffect } from 'react';
import { 
  UserCheck, BedDouble, Users, CheckCircle2, RefreshCw, 
  Trash2, ArrowRight, ShieldAlert, Sparkles, Filter 
} from 'lucide-react';
import { db } from '../../db/database';
import { Reservation, Room, Bed, RoomAssignment, Guest, Group } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDateIndo } from '../../utils/formatters';

interface RoomAssignmentPageProps {
  initialReservationId?: string;
  onNavigate: (page: string, targetId?: string) => void;
}

export const RoomAssignmentPage: React.FC<RoomAssignmentPageProps> = ({
  initialReservationId,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRsvId, setSelectedRsvId] = useState<string>(initialReservationId || '');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // Manual assign form state
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedBedId, setSelectedBedId] = useState<string>('');
  const [selectedGuestName, setSelectedGuestName] = useState<string>('');
  const [separateGender, setSeparateGender] = useState<boolean>(true);

  const loadData = () => {
    const rsvs = db.getReservations().filter((r) => r.status !== 'CANCELLED' && r.status !== 'REJECTED');
    setReservations(rsvs);
    setRooms(db.getRooms());
    setBeds(db.getBeds());
    setAssignments(db.getRoomAssignments());
    setGuests(db.getGuests());
    setGroups(db.getGroups());

    if (!selectedRsvId && rsvs.length > 0) {
      setSelectedRsvId(rsvs[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialReservationId]);

  const currentRsv = reservations.find((r) => r.id === selectedRsvId);

  const currentAssignments = assignments.filter(
    (a) => a.reservation_id === selectedRsvId && a.status !== 'CANCELLED'
  );

  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE');

  const getGuestOrGroupName = (rsv?: Reservation): string => {
    if (!rsv) return '';
    if (rsv.group_id) {
      const g = groups.find((grp) => grp.id === rsv.group_id);
      if (g) return g.group_name;
    }
    if (rsv.guest_id) {
      const gst = guests.find((g) => g.id === rsv.guest_id);
      if (gst) return gst.full_name;
    }
    return rsv.activity_name || 'Tamu';
  };

  const handleAutoAssign = () => {
    if (!currentRsv || !currentUser) return;

    const result = db.autoAssignReservation(currentRsv.id, currentUser, separateGender);
    if (result.assignedCount > 0) {
      toast.success('Penempatan Otomatis Berhasil', result.message);
      loadData();
    } else {
      toast.error('Penempatan Gagal', result.message);
    }
  };

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRsv || !currentUser || !selectedRoomId || !selectedBedId) {
      toast.error('Gagal', 'Silakan pilih kamar dan tempat tidur.');
      return;
    }

    // Check if bed already assigned
    const success = db.assignRoomBed(
      currentRsv.id,
      selectedGuestName || `Tamu-${currentAssignments.length + 1}`,
      selectedRoomId,
      selectedBedId,
      currentUser
    );

    if (success) {
      toast.success('Penempatan Sukses', 'Tamu berhasil ditempatkan pada tempat tidur.');
      setSelectedBedId('');
      setSelectedGuestName('');
      loadData();
    } else {
      toast.error('Gagal', 'Tempat tidur ini sudah terisi atau tidak tersedia.');
    }
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    if (!currentUser) return;
    db.removeAssignment(assignmentId, currentUser);
    toast.info('Penempatan Dibatalkan', 'Tempat tidur kembali berstatus AVAILABLE.');
    loadData();
  };

  const getRoomByBed = (bedId: string) => {
    const bed = beds.find((b) => b.id === bedId);
    if (!bed) return null;
    return rooms.find((r) => r.id === bed.room_id);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-800" />
            Penempatan Kamar & Alokasi Bed (Room Assignment)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Petugas dapat mengatur penempatan tamu individu atau rombongan haji ke kamar dan nomor tempat tidur secara otomatis atau manual.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadData}
          icon={<RefreshCw className="w-4 h-4 text-emerald-800" />}
        >
          Muat Ulang
        </Button>
      </div>

      {/* Select Reservation / Group */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-96">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Pilih Reservasi / Rombongan Aktif:
          </label>
          <select
            value={selectedRsvId}
            onChange={(e) => setSelectedRsvId(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-slate-50/50 font-semibold"
          >
            {reservations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.reservation_no} — {getGuestOrGroupName(r)} ({r.total_guests} Tamu)
              </option>
            ))}
          </select>
        </div>

        {currentRsv && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Total Tamu</span>
              <span className="font-extrabold text-slate-900">{currentRsv.total_guests} Orang</span>
              <span className="text-slate-400 text-[10px] ml-1">({currentRsv.male_count}L / {currentRsv.female_count}P)</span>
            </div>

            <div className="bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 text-xs">
              <span className="text-emerald-700 block text-[10px] font-bold uppercase">Sudah Ditempatkan</span>
              <span className="font-extrabold text-emerald-900">
                {currentAssignments.length} / {currentRsv.total_guests} Bed
              </span>
            </div>

            <div className="bg-blue-50 px-3 py-2 rounded-xl border border-blue-200 text-xs">
              <span className="text-blue-700 block text-[10px] font-bold uppercase">Bed Kosong Asrama</span>
              <span className="font-extrabold text-blue-900">{availableBeds.length} Bed</span>
            </div>
          </div>
        )}
      </div>

      {currentRsv && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Assignment Actions & Tools */}
          <div className="space-y-6">
            {/* Auto Assign Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Auto Assign (Penempatan Otomatis)
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Sistem akan secara cerdas menempatkan seluruh peserta rombongan ke kamar dan tempat tidur kosong yang tersedia.
              </p>

              <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={separateGender}
                  onChange={(e) => setSeparateGender(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4"
                />
                <span>Pisahkan kamar pria dan wanita (Syari’ah)</span>
              </label>

              <Button
                variant="primary"
                onClick={handleAutoAssign}
                className="w-full"
                icon={<Sparkles className="w-4 h-4" />}
              >
                Jalankan Auto Assign ({currentRsv.total_guests - currentAssignments.length} Tamu)
              </Button>
            </div>

            {/* Manual Assign Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Penempatan Manual (Manual Assign)</h3>
              <p className="text-xs text-slate-500 mb-4">Pilih kamar dan nomor bed secara spesifik.</p>

              <form onSubmit={handleManualAssign} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Tamu / Label Bed</label>
                  <input
                    type="text"
                    placeholder="Contoh: H. Burhanudin / Peserta 01"
                    value={selectedGuestName}
                    onChange={(e) => setSelectedGuestName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Kamar *</label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value);
                      setSelectedBedId(''); // Reset bed
                    }}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">-- Pilih Kamar --</option>
                    {rooms.map((rm) => (
                      <option key={rm.id} value={rm.id}>
                        Kamar {rm.room_number} ({rm.capacity} Bed, Status: {rm.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Tempat Tidur (Bed) *</label>
                  <select
                    value={selectedBedId}
                    onChange={(e) => setSelectedBedId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">-- Pilih Nomor Bed --</option>
                    {beds
                      .filter((b) => b.room_id === selectedRoomId && b.status === 'AVAILABLE')
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bed_code} (Tersedia)
                        </option>
                      ))}
                  </select>
                </div>

                <Button variant="secondary" type="submit" className="w-full mt-2 font-semibold">
                  Tempatkan Tamu Ini
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column: List of Current Assignments */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Tamu & Alokasi Bed Terdaftar ({currentAssignments.length})
                </h3>
                <p className="text-xs text-slate-500">
                  {currentRsv.reservation_no} &bull; Periode: {formatDateIndo(currentRsv.checkin_date)} s/d {formatDateIndo(currentRsv.checkout_date)}
                </p>
              </div>

              {currentAssignments.length > 0 && currentRsv.status === 'CONFIRMED' && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onNavigate('checkin', currentRsv.id)}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Lanjut ke Check-in
                </Button>
              )}
            </div>

            {currentAssignments.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                Belum ada tamu yang ditempatkan ke kamar pada reservasi ini.
                <br />Gunakan tombol <span className="font-semibold text-emerald-800">Auto Assign</span> atau form manual di samping kiri.
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Tamu / Peserta</th>
                      <th className="py-2.5 px-3">Kamar</th>
                      <th className="py-2.5 px-3">Kode Bed</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentAssignments.map((a, idx) => {
                      const room = getRoomByBed(a.bed_id);
                      const bed = beds.find((b) => b.id === a.bed_id);

                      return (
                        <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            {a.guest_id.startsWith('gst-auto') ? `Peserta Jamaah #${idx + 1}` : a.guest_id}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {room ? `Kamar ${room.room_number}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">
                            {bed?.bed_code || a.bed_id}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge status={a.status} size="sm" />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleRemoveAssignment(a.id)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Batalkan Penempatan Bed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
