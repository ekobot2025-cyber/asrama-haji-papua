import React, { useState } from 'react';
import { 
  LogIn, LogOut, CheckCircle2, XCircle, ArrowUpRight, 
  CalendarCheck, Clock, Users, Building, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Reservation, Room, Guest, Group } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { db } from '../../db/database';
import { formatCurrency, formatDateIndo } from '../../utils/formatters';

interface TodayOperationsProps {
  todayCheckins: Reservation[];
  todayCheckouts: Reservation[];
  pendingReservations: Reservation[];
  onNavigate: (page: string, targetId?: string) => void;
  onRefresh: () => void;
}

export const TodayOperations: React.FC<TodayOperationsProps> = ({
  todayCheckins,
  todayCheckouts,
  pendingReservations,
  onNavigate,
  onRefresh,
}) => {
  const { currentUser, hasPermission } = useAuth();
  const toast = useToast();

  const [verifyModal, setVerifyModal] = useState<{
    isOpen: boolean;
    reservation?: Reservation;
    isApprove: boolean;
  }>({
    isOpen: false,
    isApprove: true,
  });

  const guests = db.getGuests();
  const groups = db.getGroups();
  const institutions = db.getInstitutions();

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
    return rsv.activity_name || 'Tamu Asrama Haji';
  };

  const getInstitutionName = (rsv?: Reservation | null): string => {
    if (!rsv) return '';
    if (!rsv.institution_id) return 'Individu / Mandiri';
    const inst = institutions.find((i) => i.id === rsv.institution_id);
    return inst ? inst.name : 'Instansi Pemerintah';
  };

  const handleConfirmVerification = () => {
    if (!verifyModal.reservation || !currentUser) return;

    const success = db.verifyReservation(
      verifyModal.reservation.id,
      currentUser,
      verifyModal.isApprove,
      verifyModal.isApprove ? 'Disetujui via Quick Action Dashboard' : 'Ditolak via Quick Action Dashboard'
    );

    if (success) {
      toast.success(
        verifyModal.isApprove ? 'Reservasi Disetujui' : 'Reservasi Ditolak',
        `Reservasi ${verifyModal.reservation.reservation_no} berhasil diperbarui.`
      );
      setVerifyModal({ isOpen: false, isApprove: true });
      onRefresh();
    } else {
      toast.error('Gagal', 'Terjadi kesalahan saat memproses verifikasi.');
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Check-in Hari Ini */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Check-in Hari Ini</h4>
                <p className="text-[11px] text-slate-500">{todayCheckins.length} tamu / rombongan terjadwal</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('checkin')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
            >
              Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-80 mt-2">
            {todayCheckins.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada check-in terjadwal untuk hari ini.
              </div>
            ) : (
              todayCheckins.map((rsv) => (
                <div key={rsv.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{getGuestOrGroupName(rsv)}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                      {getInstitutionName(rsv)}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {rsv.total_guests} Orang
                      </span>
                      <span>&bull;</span>
                      <span className="font-medium text-slate-700">{rsv.total_rooms_requested} Kamar</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge status={rsv.status} size="sm" />
                    {rsv.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onNavigate('checkin', rsv.id)}
                        className="py-1 px-2.5 text-[11px]"
                      >
                        Check-in
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: Check-out Hari Ini */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-800">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Check-out Hari Ini</h4>
                <p className="text-[11px] text-slate-500">{todayCheckouts.length} tamu / rombongan terjadwal</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('checkout')}
              className="text-xs font-semibold text-blue-800 hover:text-blue-900 flex items-center gap-1"
            >
              Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-80 mt-2">
            {todayCheckouts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada check-out terjadwal untuk hari ini.
              </div>
            ) : (
              todayCheckouts.map((rsv) => (
                <div key={rsv.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{getGuestOrGroupName(rsv)}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[200px]">
                      {rsv.reservation_no}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                      <span className="text-slate-500">{rsv.total_guests} Tamu</span>
                      <span>&bull;</span>
                      <span className={`font-semibold ${rsv.payment_status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {rsv.payment_status === 'PAID' ? 'LUNAS' : `Sisa: ${formatCurrency(rsv.remaining_amount)}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge status={rsv.status} size="sm" />
                    {rsv.status === 'CHECKED_IN' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigate('checkout', rsv.id)}
                        className="py-1 px-2.5 text-[11px]"
                      >
                        Checkout
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 3: Reservasi Menunggu Verifikasi (Quick Actions) */}
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Menunggu Verifikasi</h4>
                <p className="text-[11px] text-slate-500">{pendingReservations.length} permohonan baru</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('reservations')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-80 mt-2">
            {pendingReservations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada permohonan reservasi yang menunggu verifikasi.
              </div>
            ) : (
              pendingReservations.map((rsv) => (
                <div key={rsv.id} className="py-3 text-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{getGuestOrGroupName(rsv)}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {rsv.reservation_no} &bull; {getInstitutionName(rsv)}
                      </p>
                    </div>
                    <Badge status="PENDING" size="sm" />
                  </div>

                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg flex items-center justify-between">
                    <span>Jadwal: {formatDateIndo(rsv.checkin_date)}</span>
                    <span className="font-semibold text-slate-800">{rsv.total_guests} Tamu</span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setVerifyModal({ isOpen: true, reservation: rsv, isApprove: true })}
                      className="flex-1 py-1 text-[11px] bg-emerald-700 hover:bg-emerald-800"
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Verifikasi
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate('reservations', rsv.id)}
                      className="py-1 text-[11px] px-2.5"
                    >
                      Detail
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setVerifyModal({ isOpen: true, reservation: rsv, isApprove: false })}
                      className="py-1 text-[11px] px-2"
                      title="Tolak Reservasi"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Verification / Rejection */}
      <ConfirmDialog
        isOpen={verifyModal.isOpen}
        onClose={() => setVerifyModal({ isOpen: false, isApprove: true })}
        onConfirm={handleConfirmVerification}
        title={verifyModal.isApprove ? 'Verifikasi dan Setujui Reservasi' : 'Tolak Permohonan Reservasi'}
        message={
          verifyModal.isApprove
            ? `Apakah Anda yakin ingin memverifikasi dan menyetujui reservasi ${verifyModal.reservation?.reservation_no || ''} untuk ${getGuestOrGroupName(verifyModal.reservation)}? Status akan berubah menjadi CONFIRMED.`
            : `Apakah Anda yakin ingin menolak reservasi ${verifyModal.reservation?.reservation_no || ''}? Status akan berubah menjadi REJECTED.`
        }
        confirmText={verifyModal.isApprove ? 'Ya, Setujui Reservasi' : 'Ya, Tolak Permohonan'}
        variant={verifyModal.isApprove ? 'primary' : 'danger'}
      />
    </>
  );
};
