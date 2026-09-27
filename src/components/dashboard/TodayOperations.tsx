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
        <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover transition-all duration-200 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-[#fbf8ee] text-[#8a6d2b] ring-4 ring-[#c9a961]/20 shrink-0">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Check-in Hari Ini</h4>
                <p className="text-xs text-slate-500">{todayCheckins.length} tamu / rombongan terjadwal</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('checkin')}
              className="text-xs font-semibold text-[#8a6d2b] hover:text-[#7a6122] flex items-center gap-1 bg-[#fbf8ee] hover:bg-[#f4ebd0] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-80 mt-3.5 custom-scrollbar pr-1">
            {todayCheckins.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span>Tidak ada check-in terjadwal untuk hari ini.</span>
              </div>
            ) : (
              todayCheckins.map((rsv) => (
                <div key={rsv.id} className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 hover:border-[#c9a961] transition-all duration-150 flex items-start justify-between gap-3 text-xs group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#fbf8ee] text-[#8a6d2b] font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-[#c9a961]/30">
                      {getGuestOrGroupName(rsv).charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-[#8a6d2b] transition-colors">{getGuestOrGroupName(rsv)}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {getInstitutionName(rsv)}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1 font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                          <Users className="w-3 h-3 text-slate-400" />
                          {rsv.total_guests} Orang
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200/60 font-medium">
                          {rsv.total_rooms_requested} Kamar
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge status={rsv.status} size="sm" />
                    {rsv.status === 'CONFIRMED' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onNavigate('checkin', rsv.id)}
                        className="py-1 px-3 text-[11px] font-semibold"
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
        <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover transition-all duration-200 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-800 ring-4 ring-blue-500/10 shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Check-out Hari Ini</h4>
                <p className="text-xs text-slate-500">{todayCheckouts.length} tamu / rombongan terjadwal</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('checkout')}
              className="text-xs font-semibold text-blue-800 hover:text-blue-950 flex items-center gap-1 bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-80 mt-3.5 custom-scrollbar pr-1">
            {todayCheckouts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span>Tidak ada check-out terjadwal untuk hari ini.</span>
              </div>
            ) : (
              todayCheckouts.map((rsv) => (
                <div key={rsv.id} className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 hover:border-blue-200 transition-all duration-150 flex items-start justify-between gap-3 text-xs group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-blue-600/10">
                      {getGuestOrGroupName(rsv).charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-950 transition-colors">{getGuestOrGroupName(rsv)}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {rsv.reservation_no}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                        <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200/60 font-medium text-slate-600">
                          {rsv.total_guests} Tamu
                        </span>
                        <span className={`px-2 py-0.5 rounded-md border font-semibold ${
                          rsv.payment_status === 'PAID' 
                            ? 'bg-[#fbf8ee] text-[#8a6d2b] border-[#e8dfc8]' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {rsv.payment_status === 'PAID' ? 'LUNAS' : `Sisa: ${formatCurrency(rsv.remaining_amount)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge status={rsv.status} size="sm" />
                    {rsv.status === 'CHECKED_IN' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onNavigate('checkout', rsv.id)}
                        className="py-1 px-3 text-[11px] font-semibold"
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
        <div className="rounded-3xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)] hover:shadow-card-hover transition-all duration-200 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-800 ring-4 ring-amber-500/10 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Menunggu Verifikasi</h4>
                <p className="text-xs text-slate-500">{pendingReservations.length} permohonan baru</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('reservations')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-80 mt-3.5 custom-scrollbar pr-1">
            {pendingReservations.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span>Tidak ada permohonan yang menunggu verifikasi.</span>
              </div>
            ) : (
              pendingReservations.map((rsv) => (
                <div key={rsv.id} className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/60 hover:border-amber-200 transition-all duration-150 text-xs space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{getGuestOrGroupName(rsv)}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">{rsv.reservation_no}</span> &bull; {getInstitutionName(rsv)}
                      </p>
                    </div>
                    <Badge status="PENDING" size="sm" />
                  </div>

                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-200/60 flex items-center justify-between">
                    <span>Jadwal: <strong>{formatDateIndo(rsv.checkin_date)}</strong></span>
                    <span className="font-semibold text-slate-800">{rsv.total_guests} Tamu</span>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setVerifyModal({ isOpen: true, reservation: rsv, isApprove: true })}
                      className="flex-1 py-1 text-[11px] font-semibold"
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Setujui
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate('reservations', rsv.id)}
                      className="py-1 text-[11px] px-2.5 font-medium"
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
