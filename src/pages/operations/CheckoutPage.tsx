import React, { useState, useEffect } from 'react';
import { 
  LogOut, Search, CheckCircle2, AlertTriangle, Key, 
  Receipt, Clock, UserCheck, ShieldCheck, Sparkles 
} from 'lucide-react';
import { db } from '../../db/database';
import { Reservation, Guest, Group, RoomAssignment, Room } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo, calculateNights } from '../../utils/formatters';

interface CheckoutPageProps {
  initialReservationId?: string;
  onNavigate: (page: string, targetId?: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ initialReservationId, onNavigate }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Checkout modal
  const [selectedRsv, setSelectedRsv] = useState<Reservation | null>(null);
  const [roomConditionNotes, setRoomConditionNotes] = useState('Kamar rapi, fasilitas lengkap tidak ada kerusakan');
  const [returnDeposit, setReturnDeposit] = useState(true);
  const [checkoutNotes, setCheckoutNotes] = useState('Tamu selesai menginap');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = () => {
    setReservations(db.getReservations());
    setGuests(db.getGuests());
    setGroups(db.getGroups());
    setAssignments(db.getRoomAssignments());
    setRooms(db.getRooms());
  };

  useEffect(() => {
    loadData();
    if (initialReservationId) {
      const target = db.getReservations().find((r) => r.id === initialReservationId);
      if (target && target.status === 'CHECKED_IN') {
        handleOpenCheckout(target);
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

  const getAssignedRooms = (rsvId: string) => {
    const rsvAssignments = assignments.filter((a) => a.reservation_id === rsvId && a.status !== 'CANCELLED');
    const roomIds = Array.from(new Set(rsvAssignments.map((a) => a.room_id)));
    return roomIds
      .map((id) => rooms.find((r) => r.id === id)?.room_number)
      .filter(Boolean)
      .join(', ');
  };

  const handleOpenCheckout = (rsv: Reservation) => {
    setSelectedRsv(rsv);
    setRoomConditionNotes('Kondisi kamar dalam keadaan baik, kunci kartu lengkap dikembalikan.');
    setReturnDeposit(true);
    setCheckoutNotes('Tamu telah checkout secara resmi.');
    setIsModalOpen(true);
  };

  const handleExecuteCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRsv || !currentUser) return;

    if (selectedRsv.remaining_amount > 0) {
      if (!confirm(`Perhatian: Reservasi ini masih memiliki sisa tagihan sebesar ${formatCurrency(selectedRsv.remaining_amount)}. Tetap lanjutkan checkout?`)) {
        return;
      }
    }

    const success = db.checkoutReservation(
      selectedRsv.id,
      roomConditionNotes,
      returnDeposit,
      checkoutNotes,
      currentUser
    );

    if (success) {
      toast.success(
        'Checkout Berhasil',
        `Reservasi ${selectedRsv.reservation_no} telah checkout. Kamar dialihkan ke status CLEANING (Dirty) untuk tim Housekeeping.`
      );
      setIsModalOpen(false);
      loadData();
    } else {
      toast.error('Gagal', 'Terjadi kesalahan saat memproses checkout.');
    }
  };

  // Only show active checked-in reservations
  const checkedInReservations = reservations.filter((r) => {
    const matchSearch =
      r.reservation_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGuestOrGroupName(r).toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch && r.status === 'CHECKED_IN';
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LogOut className="w-6 h-6 text-emerald-800" />
            Check-out Tamu & Serah Terima Kamar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pemeriksaan kondisi kamar, pengecekan pelunasan tagihan, pengembalian deposit, dan transisi kamar ke Housekeeping.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari tamu yang sedang menginap..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700 bg-white"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {checkedInReservations.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Tidak ada tamu yang sedang berstatus menginap (Checked-in) saat ini.
          </div>
        ) : (
          checkedInReservations.map((rsv) => {
            const assignedRoomsStr = getAssignedRooms(rsv.id);
            const nights = calculateNights(rsv.checkin_date, rsv.checkout_date);
            const isUnpaid = rsv.remaining_amount > 0;

            return (
              <div
                key={rsv.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-emerald-900">{rsv.reservation_no}</span>
                    <Badge status="OCCUPIED" label="Menginap" size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">{getGuestOrGroupName(rsv)}</h3>
                  <p className="text-xs text-slate-500 mb-3">{rsv.activity_name || '-'}</p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Kamar Ditempati:</span>
                      <span className="font-bold text-emerald-800">
                        {assignedRoomsStr ? `Kamar ${assignedRoomsStr}` : '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Lama Menginap:</span>
                      <span className="font-medium text-slate-700">{nights} Malam ({formatDateIndo(rsv.checkin_date)} s/d {formatDateIndo(rsv.checkout_date)})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Tagihan:</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(rsv.total_amount)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-500">Status Pembayaran:</span>
                      <span className={`font-bold ${isUnpaid ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {isUnpaid ? `Belum Lunas: ${formatCurrency(rsv.remaining_amount)}` : 'LUNAS'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isUnpaid && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate('invoices', rsv.id)}
                      className="text-xs"
                      icon={<Receipt className="w-3.5 h-3.5 text-amber-600" />}
                    >
                      Bayar Dulu
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleOpenCheckout(rsv)}
                    className="flex-1"
                    icon={<LogOut className="w-4 h-4" />}
                  >
                    Proses Check-out
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Eksekusi Checkout */}
      {selectedRsv && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Konfirmasi Check-out — ${selectedRsv.reservation_no}`}
          subtitle={getGuestOrGroupName(selectedRsv)}
          maxWidth="md"
        >
          <form onSubmit={handleExecuteCheckout} className="space-y-4 text-xs">
            {/* Warning if unpaid */}
            {selectedRsv.remaining_amount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Peringatan: Tagihan Belum Lunas!</p>
                  <p className="text-[11px] mt-0.5">
                    Terdapat sisa pembayaran sebesar <span className="font-bold">{formatCurrency(selectedRsv.remaining_amount)}</span>. Harap selesaikan pelunasan sebelum tamu meninggalkan asrama.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Kamar yang Dikosongkan:</span>
                <span className="font-bold text-emerald-800">{getAssignedRooms(selectedRsv.id)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Petugas Checkout:</span>
                <span className="font-bold">{currentUser?.name || 'Petugas'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status Pasca Checkout:</span>
                <span className="font-bold text-orange-600">CLEANING (Dirty) &rarr; Housekeeping</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kondisi Kamar & Kelengkapan Fasilitas *
              </label>
              <textarea
                rows={2}
                required
                value={roomConditionNotes}
                onChange={(e) => setRoomConditionNotes(e.target.value)}
                placeholder="Periksa AC, handuk, remote TV, sprei, dan tidak ada barang tertinggal..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={returnDeposit}
                onChange={(e) => setReturnDeposit(e.target.checked)}
                className="rounded text-emerald-800 focus:ring-emerald-700 w-4 h-4"
              />
              <span>Kunci kartu diterima lengkap & jaminan/deposit dikembalikan</span>
            </label>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan</label>
              <input
                type="text"
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" icon={<LogOut className="w-4 h-4" />}>
                Selesaikan Check-out
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
