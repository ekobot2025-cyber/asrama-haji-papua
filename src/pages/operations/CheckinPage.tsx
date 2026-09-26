import React, { useState, useEffect } from 'react';
import { 
  LogIn, Search, CheckCircle2, UserCheck, Key, 
  CreditCard, Clock, Building, Users, Calendar, ArrowRight, Hotel, Printer
} from 'lucide-react';
import { db } from '../../db/database';
import { Reservation, Guest, Group, Institution, RoomAssignment, Room, Bed, Building as BuildingType } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { WalkInModal } from '../../components/operations/WalkInModal';
import { SpmaModal } from '../../components/operations/SpmaModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';

interface CheckinPageProps {
  initialReservationId?: string;
  onNavigate: (page: string, targetId?: string) => void;
}

export const CheckinPage: React.FC<CheckinPageProps> = ({ initialReservationId, onNavigate }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [buildings, setBuildings] = useState<BuildingType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Check-in modal
  const [selectedRsv, setSelectedRsv] = useState<Reservation | null>(null);
  const [spmaTarget, setSpmaTarget] = useState<Reservation | null>(null);
  const [cardKeys, setCardKeys] = useState<number>(1);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [checkinNotes, setCheckinNotes] = useState<string>('');
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  const loadData = () => {
    setReservations(db.getReservations());
    setGuests(db.getGuests());
    setGroups(db.getGroups());
    setInstitutions(db.getInstitutions());
    setAssignments(db.getRoomAssignments());
    setRooms(db.getRooms());
    setBeds(db.getBeds());
    setBuildings(db.getBuildings());
  };

  useEffect(() => {
    loadData();
    if (initialReservationId) {
      const target = db.getReservations().find((r) => r.id === initialReservationId);
      if (target && target.status === 'CONFIRMED') {
        handleOpenCheckin(target);
      }
    }
  }, [initialReservationId]);

  const getGuestOrGroupName = (rsv?: Reservation | null): string => {
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

  const getInstitutionName = (rsv?: Reservation | null): string => {
    if (!rsv) return '';
    if (!rsv.institution_id) return 'Mandiri / Individu';
    const inst = institutions.find((i) => i.id === rsv.institution_id);
    return inst ? inst.name : 'Instansi';
  };

  const getAssignedRooms = (rsvId: string) => {
    const rsvAssignments = assignments.filter((a) => a.reservation_id === rsvId && a.status !== 'CANCELLED');
    const roomIds = Array.from(new Set(rsvAssignments.map((a) => a.room_id)));
    return roomIds
      .map((id) => rooms.find((r) => r.id === id)?.room_number)
      .filter(Boolean)
      .join(', ');
  };

  const handleOpenCheckin = (rsv: Reservation) => {
    setSelectedRsv(rsv);
    setCardKeys(rsv.total_rooms_requested || 1);
    setDepositAmount(rsv.reservation_type === 'ROMBONGAN' ? 500000 : 100000);
    setCheckinNotes(`Tamu check-in pada periode ${rsv.checkin_date}.`);
    setIsCheckinModalOpen(true);
  };

  const handleExecuteCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRsv || !currentUser) return;

    // Check if room assignment exists
    const rsvAssignments = assignments.filter((a) => a.reservation_id === selectedRsv.id && a.status !== 'CANCELLED');
    if (rsvAssignments.length === 0) {
      toast.warning('Perhatian', 'Kamar belum dialokasikan untuk reservasi ini. Silakan lakukan Penempatan Kamar terlebih dahulu.');
      setIsCheckinModalOpen(false);
      onNavigate('room-assignment', selectedRsv.id);
      return;
    }

    const success = db.checkinReservation(
      selectedRsv.id,
      cardKeys,
      depositAmount,
      checkinNotes,
      currentUser
    );

    if (success) {
      toast.success('Check-in Berhasil', `Reservasi ${selectedRsv.reservation_no} telah resmi check-in. Kamar kini berstatus OCCUPIED.`);
      setIsCheckinModalOpen(false);
      loadData();
    } else {
      toast.error('Gagal', 'Terjadi kesalahan saat check-in.');
    }
  };

  // Filter reservations eligible for checkin or checked in today
  const eligibleReservations = reservations.filter((r) => {
    const matchSearch =
      r.reservation_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGuestOrGroupName(r).toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch && (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN');
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LogIn className="w-6 h-6 text-emerald-800" />
            Check-in Tamu & Registrasi Masuk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Proses verifikasi tamu tiba, serah terima kunci kartu (card key), pencatatan deposit, dan aktivasi kamar menjadi OCCUPIED.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="amber"
            size="md"
            onClick={() => setIsWalkInOpen(true)}
            icon={<Hotel className="w-4 h-4" />}
          >
            + Tamu Walk-In (Check-in Kilat)
          </Button>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari reservasi / tamu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eligibleReservations.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Tidak ada tamu terkonfirmasi yang menunggu check-in saat ini.
          </div>
        ) : (
          eligibleReservations.map((rsv) => {
            const assignedRoomsStr = getAssignedRooms(rsv.id);
            const isCheckedIn = rsv.status === 'CHECKED_IN';

            return (
              <div
                key={rsv.id}
                className={`p-5 rounded-2xl border bg-white shadow-xs flex flex-col justify-between transition-all ${
                  isCheckedIn ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  {/* Top Bar: No and Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-emerald-900">{rsv.reservation_no}</span>
                    <Badge status={rsv.status} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1">{getGuestOrGroupName(rsv)}</h3>
                  <p className="text-xs text-slate-500 truncate mb-3">{getInstitutionName(rsv)}</p>

                  {/* Info Grid */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Jumlah Peserta:</span>
                      <span className="font-bold text-slate-800">{rsv.total_guests} Orang</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Periode:</span>
                      <span className="font-medium text-slate-700">
                        {formatDateIndo(rsv.checkin_date)} s/d {formatDateIndo(rsv.checkout_date)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Alokasi Kamar:</span>
                      <span className="font-bold text-emerald-800">
                        {assignedRoomsStr ? `Kamar ${assignedRoomsStr}` : 'Belum Ditentukan'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Status Pembayaran:</span>
                      <span className={`font-semibold ${rsv.payment_status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {rsv.payment_status === 'PAID' ? 'Lunas' : formatCurrency(rsv.remaining_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSpmaTarget(rsv)}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-emerald-800 transition-colors flex-shrink-0"
                    title="Cetak SPMA Digital & Label Koper (Munakosah)"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {!assignedRoomsStr ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate('room-assignment', rsv.id)}
                      className="w-full"
                      icon={<UserCheck className="w-4 h-4 text-blue-600" />}
                    >
                      Pilih Kamar Dulu
                    </Button>
                  ) : !isCheckedIn ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleOpenCheckin(rsv)}
                      className="w-full"
                      icon={<LogIn className="w-4 h-4" />}
                    >
                      Proses Check-in
                    </Button>
                  ) : (
                    <div className="flex items-center justify-between w-full text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                      <span>Sudah Check-in</span>
                      <button
                        onClick={() => onNavigate('checkout', rsv.id)}
                        className="text-emerald-800 hover:underline font-bold"
                      >
                        Checkout &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Eksekusi Check-in */}
      {selectedRsv && (
        <Modal
          isOpen={isCheckinModalOpen}
          onClose={() => setIsCheckinModalOpen(false)}
          title={`Konfirmasi Check-in — ${selectedRsv.reservation_no}`}
          subtitle={getGuestOrGroupName(selectedRsv)}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteCheckin} className="space-y-4 text-xs">
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 space-y-1.5 text-emerald-900">
              <div className="flex justify-between">
                <span>Nama Tamu / Rombongan:</span>
                <span className="font-bold">{getGuestOrGroupName(selectedRsv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Instansi:</span>
                <span className="font-medium">{getInstitutionName(selectedRsv)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tamu:</span>
                <span className="font-bold">{selectedRsv.total_guests} Orang</span>
              </div>
              <div className="flex justify-between">
                <span>Alokasi Kamar:</span>
                <span className="font-bold text-emerald-800">{getAssignedRooms(selectedRsv.id)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Kunci Kartu (Keycard) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cardKeys}
                  onChange={(e) => setCardKeys(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deposit Kunci / Jaminan (Rp)</label>
                <input
                  type="number"
                  step="50000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Petugas Penerima (Front Desk)</label>
              <input
                type="text"
                disabled
                value={currentUser?.name || 'Petugas'}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan Saat Masuk</label>
              <textarea
                rows={2}
                value={checkinNotes}
                onChange={(e) => setCheckinNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsCheckinModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" icon={<LogIn className="w-4 h-4" />}>
                Selesaikan Check-in
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Hotel Walk-In Guest Modal */}
      <WalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onSuccess={loadData}
      />

      {/* SPMA & Tag Bagasi Modal Munakosah */}
      {spmaTarget && (
        <SpmaModal
          isOpen={!!spmaTarget}
          onClose={() => setSpmaTarget(null)}
          reservation={spmaTarget}
          guest={guests.find((g) => g.id === spmaTarget.guest_id)}
          room={(() => {
            const assign = assignments.find((a) => a.reservation_id === spmaTarget.id);
            return rooms.find((r) => r.id === assign?.room_id) || rooms[0];
          })()}
          bed={(() => {
            const assign = assignments.find((a) => a.reservation_id === spmaTarget.id);
            return beds.find((b) => b.id === assign?.bed_id) || beds[0];
          })()}
          building={(() => {
            const assign = assignments.find((a) => a.reservation_id === spmaTarget.id);
            const r = rooms.find((rm) => rm.id === assign?.room_id) || rooms[0];
            return buildings.find((b) => b.id === r?.building_id) || buildings[0];
          })()}
        />
      )}
    </div>
  );
};
