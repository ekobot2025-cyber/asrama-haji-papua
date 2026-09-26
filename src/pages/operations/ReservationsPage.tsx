import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Plus, Search, Filter, Eye, CheckCircle2, 
  XCircle, UserCheck, LogIn, LogOut, Printer, Calendar, Users, 
  Briefcase, Landmark, FileText, ChevronRight 
} from 'lucide-react';
import { db } from '../../db/database';
import { Reservation, Guest, Group, Institution, ReservationStatus, Building, Room, Bed, RoomAssignment } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { SpmaModal } from '../../components/operations/SpmaModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo, calculateNights } from '../../utils/formatters';

interface ReservationsPageProps {
  onNavigate: (page: string, targetId?: string) => void;
  initialTargetId?: string;
}

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ onNavigate, initialTargetId }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [roomAssignments, setRoomAssignments] = useState<RoomAssignment[]>([]);

  // SPMA Modal state
  const [spmaTarget, setSpmaTarget] = useState<Reservation | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // New Reservation Modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newFormData, setNewFormData] = useState({
    reservation_type: 'INDIVIDUAL' as 'INDIVIDUAL' | 'ROMBONGAN' | 'INSTANSI' | 'KEGIATAN',
    package_type: 'REGULER' as 'REGULER' | 'FULLBOARD_DIKLAT' | 'MANASIK_AKBAR' | 'HALFDAY_MEETING',
    pic_name: '',
    pic_phone: '',
    pic_email: '',
    institution_id: '',
    activity_type: 'KEDINASAN',
    activity_name: '',
    checkin_date: '2026-09-27',
    checkout_date: '2026-09-30',
    total_guests: 1,
    male_count: 1,
    female_count: 0,
    total_rooms_requested: 1,
    facility_requirements: '',
    total_amount: 1050000,
    notes: '',
  });

  // Verification dialog
  const [verifyModal, setVerifyModal] = useState<{
    isOpen: boolean;
    reservation?: Reservation;
    isApprove: boolean;
  }>({ isOpen: false, isApprove: true });

  const loadData = () => {
    setReservations(db.getReservations());
    setGuests(db.getGuests());
    setGroups(db.getGroups());
    setInstitutions(db.getInstitutions());
    setRooms(db.getRooms());
    setBeds(db.getBeds());
    setBuildings(db.getBuildings());
    setRoomAssignments(db.getRoomAssignments());
  };

  useEffect(() => {
    loadData();
    if (initialTargetId === 'new') {
      setIsNewModalOpen(true);
    }
  }, [initialTargetId]);

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
    if (!rsv.institution_id) return 'Mandiri / Pribadi';
    const inst = institutions.find((i) => i.id === rsv.institution_id);
    return inst ? inst.name : 'Instansi';
  };

  // Filter reservations
  const filtered = reservations.filter((r) => {
    const matchSearch =
      r.reservation_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGuestOrGroupName(r).toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.activity_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchType = typeFilter === 'all' || r.reservation_type === typeFilter;

    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!newFormData.pic_name) {
      toast.error('Gagal', 'Nama Pemesan / PIC wajib diisi.');
      return;
    }

    // Register or find guest
    const guest = db.saveGuest({
      full_name: newFormData.pic_name,
      phone: newFormData.pic_phone,
      email: newFormData.pic_email,
      institution_id: newFormData.institution_id || undefined,
      guest_type: newFormData.reservation_type === 'ROMBONGAN' ? 'ROMBONGAN' : 'KEDINASAN',
    });

    let groupId: string | undefined = undefined;
    if (newFormData.reservation_type === 'ROMBONGAN' || newFormData.reservation_type === 'KEGIATAN') {
      const group = db.saveGroup({
        group_name: newFormData.activity_name || `Rombongan ${newFormData.pic_name}`,
        activity_name: newFormData.activity_name || 'Kegiatan Asrama Haji',
        institution_id: newFormData.institution_id || undefined,
        pic_name: newFormData.pic_name,
        pic_phone: newFormData.pic_phone,
        pic_email: newFormData.pic_email,
        total_members: newFormData.total_guests,
        male_count: newFormData.male_count,
        female_count: newFormData.female_count,
        checkin_date: newFormData.checkin_date,
        checkout_date: newFormData.checkout_date,
      });
      groupId = group.id;
    }

    const result = db.createReservation(
      {
        reservation_type: newFormData.reservation_type,
        guest_id: guest.id,
        group_id: groupId,
        institution_id: newFormData.institution_id || undefined,
        activity_type: newFormData.activity_type,
        activity_name: newFormData.activity_name || 'Penginapan Asrama Haji Papua',
        checkin_date: newFormData.checkin_date,
        checkout_date: newFormData.checkout_date,
        total_guests: Number(newFormData.total_guests),
        male_count: Number(newFormData.male_count),
        female_count: Number(newFormData.female_count),
        total_rooms_requested: Number(newFormData.total_rooms_requested),
        facility_requirements: newFormData.facility_requirements,
        total_amount: Number(newFormData.total_amount),
        notes: newFormData.notes,
        package_type: newFormData.package_type,
      },
      currentUser
    );

    if (result.success) {
      toast.success('Reservasi Berhasil', result.message);
      setIsNewModalOpen(false);
      loadData();
    }
  };

  const handleConfirmVerification = () => {
    if (!verifyModal.reservation || !currentUser) return;
    const success = db.verifyReservation(
      verifyModal.reservation.id,
      currentUser,
      verifyModal.isApprove,
      verifyModal.isApprove ? 'Disetujui oleh petugas' : 'Ditolak permohonan'
    );
    if (success) {
      toast.success(
        verifyModal.isApprove ? 'Reservasi Disetujui' : 'Reservasi Ditolak',
        `Reservasi ${verifyModal.reservation.reservation_no} berhasil diperbarui.`
      );
      setVerifyModal({ isOpen: false, isApprove: true });
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-800" />
            Pengelolaan Reservasi & Pendaftaran Tamu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola permohonan reservasi individu, rombongan jamaah haji, instansi kedinasan, dan kegiatan keagamaan.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsNewModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Tambah Reservasi Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor reservasi, nama pemesan, rombongan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Filter Status */}
        <div className="w-full sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CHECKED_IN">CHECKED_IN</option>
            <option value="CHECKED_OUT">CHECKED_OUT</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Filter Tipe */}
        <div className="w-full sm:w-44">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-white"
          >
            <option value="all">Semua Jenis Reservasi</option>
            <option value="INDIVIDUAL">Individu</option>
            <option value="ROMBONGAN">Rombongan</option>
            <option value="INSTANSI">Instansi</option>
            <option value="KEGIATAN">Kegiatan / Bimtek</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">No. Reservasi</th>
                <th className="py-3.5 px-4">Tamu / Rombongan</th>
                <th className="py-3.5 px-4">Instansi & Kegiatan</th>
                <th className="py-3.5 px-4">Periode Menginap</th>
                <th className="py-3.5 px-4 text-center">Tamu / Kamar</th>
                <th className="py-3.5 px-4">Status & Pembayaran</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada reservasi yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((rsv) => (
                  <tr key={rsv.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* No Reservasi */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="font-mono text-emerald-900">{rsv.reservation_no}</span>
                      <p className="text-[10px] text-slate-400 font-normal mt-0.5">{formatDateIndo(rsv.reservation_date)}</p>
                    </td>

                    {/* Tamu / Rombongan */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{getGuestOrGroupName(rsv)}</div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium mt-1 inline-block">
                        {rsv.reservation_type}
                      </span>
                    </td>

                    {/* Instansi & Kegiatan */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium truncate max-w-[200px]">{getInstitutionName(rsv)}</div>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">{rsv.activity_name || '-'}</p>
                    </td>

                    {/* Periode */}
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">
                        {formatDateIndo(rsv.checkin_date)} — {formatDateIndo(rsv.checkout_date)}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {calculateNights(rsv.checkin_date, rsv.checkout_date)} Malam
                      </p>
                    </td>

                    {/* Tamu / Kamar */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-slate-900">{rsv.total_guests} Tamu</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        ({rsv.male_count}L / {rsv.female_count}P) &bull; {rsv.total_rooms_requested} Kamar
                      </p>
                    </td>

                    {/* Status & Bayar */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <Badge status={rsv.status} size="sm" />
                        <span className={`text-[10px] font-semibold ${rsv.payment_status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {rsv.payment_status === 'PAID' ? 'Lunas' : `Sisa: ${formatCurrency(rsv.remaining_amount)}`}
                        </span>
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* If Pending: Verify button */}
                        {rsv.status === 'PENDING' && (
                          <button
                            onClick={() => setVerifyModal({ isOpen: true, reservation: rsv, isApprove: true })}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                            title="Verifikasi & Setujui"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Room Assignment */}
                        {(rsv.status === 'CONFIRMED' || rsv.status === 'CHECKED_IN') && (
                          <button
                            onClick={() => onNavigate('room-assignment', rsv.id)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors"
                            title="Penempatan Kamar & Bed"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Check-in Quick Button */}
                        {rsv.status === 'CONFIRMED' && (
                          <button
                            onClick={() => onNavigate('checkin', rsv.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                            title="Proses Check-in"
                          >
                            <LogIn className="w-4 h-4" />
                          </button>
                        )}

                        {/* Check-out Quick Button */}
                        {rsv.status === 'CHECKED_IN' && (
                          <button
                            onClick={() => onNavigate('checkout', rsv.id)}
                            className="p-1.5 rounded-lg bg-orange-50 text-orange-800 hover:bg-orange-100 transition-colors"
                            title="Proses Check-out Tamu"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}

                        {/* Cetak SPMA & Tag Bagasi (Munakosah) */}
                        <button
                          onClick={() => setSpmaTarget(rsv)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                          title="Cetak SPMA & Label Bagasi Koper (Munakosah)"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Invoice & Kwitansi */}
                        <button
                          onClick={() => onNavigate('invoices', rsv.id)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Lihat Tagihan / Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Tambah Reservasi Baru */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Form Pendaftaran Reservasi Baru"
        subtitle="Sistem Informasi Penginapan Asrama Haji Papua"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
          {/* Reservation Type & Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jenis Reservasi *</label>
              <select
                value={newFormData.reservation_type}
                onChange={(e) => setNewFormData({ ...newFormData, reservation_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              >
                <option value="INDIVIDUAL">Tamu Individu / Mandiri</option>
                <option value="ROMBONGAN">Rombongan Jamaah Haji</option>
                <option value="INSTANSI">Tamu Kedinasan / Instansi</option>
                <option value="KEGIATAN">Pelatihan / Manasik / Bimtek</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kategori Kegiatan *</label>
              <select
                value={newFormData.activity_type}
                onChange={(e) => setNewFormData({ ...newFormData, activity_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              >
                <option value="HAJI_UMRAH">Jamaah Haji & Umrah</option>
                <option value="MANASIK">Bimbingan Manasik Haji</option>
                <option value="BIMTEK">Bimtek / Pelatihan Teknis</option>
                <option value="KEDINASAN">Kunjungan Kerja / Kedinasan</option>
                <option value="UMUM">Umum / Lainnya</option>
              </select>
            </div>
          </div>

          {/* Paket Terpadu (MICE / Manasik / Fullboard) */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-800" />
                Pilihan Paket Terpadu (MICE & Manasik Asrama Haji)
              </label>
              <span className="text-[10px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                Hitung Otomatis
              </span>
            </div>
            <select
              value={newFormData.package_type}
              onChange={(e) => {
                const pkg = e.target.value as any;
                let amt = newFormData.total_amount;
                let notes = newFormData.notes;
                let facReq = newFormData.facility_requirements;
                let actType = newFormData.activity_type;

                const nights = Math.max(1, calculateNights(newFormData.checkin_date, newFormData.checkout_date));

                if (pkg === 'FULLBOARD_DIKLAT') {
                  amt = 450000 * newFormData.total_guests * nights;
                  notes = 'Paket Fullboard Diklat: Termasuk sewa kamar, Aula Pertemuan, 3x Makan, dan 2x Coffee Break';
                  facReq = 'Aula Utama Cenderawasih + Sound System Wireless + Proyektor LCD';
                  actType = 'BIMTEK';
                } else if (pkg === 'MANASIK_AKBAR') {
                  amt = 3500000;
                  notes = 'Paket Manasik Akbar: Penggunaan Lapangan Manasik Haji, Replika Ka\'bah, Lintasan Sa\'i, Sound System, dan Tenda Transit';
                  facReq = 'Lapangan Manasik Haji & Replika Ka\'bah';
                  actType = 'MANASIK';
                } else if (pkg === 'HALFDAY_MEETING') {
                  amt = 2000000;
                  notes = 'Paket Halfday Meeting: Penggunaan Ruang Rapat VIP Asmat, Proyektor LCD, dan 1x Snack Box VIP';
                  facReq = 'Ruang Rapat VIP Asmat';
                  actType = 'KEDINASAN';
                } else {
                  amt = 350000 * newFormData.total_rooms_requested * nights;
                  notes = '';
                  facReq = '';
                }

                setNewFormData({
                  ...newFormData,
                  package_type: pkg,
                  total_amount: amt,
                  notes,
                  facility_requirements: facReq,
                  activity_type: actType,
                });
              }}
              className="w-full px-3 py-2 border border-emerald-300 rounded-xl bg-white font-bold text-slate-800 text-xs focus:ring-2 focus:ring-emerald-700"
            >
              <option value="REGULER">Paket Standar / Reguler (Sewa Kamar Saja)</option>
              <option value="FULLBOARD_DIKLAT">Paket Fullboard Diklat & Bimtek (Kamar + Aula + 3x Makan + 2x Snack - Rp 450.000/org/hari)</option>
              <option value="MANASIK_AKBAR">Paket Manasik Haji Akbar KBIHU (Lapangan + Replika Ka'bah + Sound - Rp 3.500.000/hari)</option>
              <option value="HALFDAY_MEETING">Paket Halfday Meeting VIP (Ruang Rapat VIP + Proyektor + Snack - Rp 2.000.000/hari)</option>
            </select>
          </div>

          {/* Activity / Event Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nama Agenda / Kegiatan / Rombongan</label>
            <input
              type="text"
              placeholder="Contoh: Rombongan Jamaah Haji Kloter 2 / Bimtek Sertifikasi Pembimbing"
              value={newFormData.activity_name}
              onChange={(e) => setNewFormData({ ...newFormData, activity_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* PIC Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Pemesan / PIC *</label>
              <input
                type="text"
                placeholder="Nama Lengkap PIC"
                required
                value={newFormData.pic_name}
                onChange={(e) => setNewFormData({ ...newFormData, pic_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp / HP *</label>
              <input
                type="text"
                placeholder="0812-xxxx-xxxx"
                required
                value={newFormData.pic_phone}
                onChange={(e) => setNewFormData({ ...newFormData, pic_phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Instansi Asal</label>
              <select
                value={newFormData.institution_id}
                onChange={(e) => setNewFormData({ ...newFormData, institution_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              >
                <option value="">Pribadi / Umum</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Check-in *</label>
              <input
                type="date"
                required
                value={newFormData.checkin_date}
                onChange={(e) => setNewFormData({ ...newFormData, checkin_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tanggal Check-out *</label>
              <input
                type="date"
                required
                value={newFormData.checkout_date}
                onChange={(e) => setNewFormData({ ...newFormData, checkout_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Guest breakdown: Total, Male, Female, Rooms */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Tamu</label>
              <input
                type="number"
                min="1"
                value={newFormData.total_guests}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setNewFormData({
                    ...newFormData,
                    total_guests: val,
                    male_count: Math.ceil(val / 2),
                    female_count: Math.floor(val / 2),
                  });
                }}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Pria (L)</label>
              <input
                type="number"
                min="0"
                value={newFormData.male_count}
                onChange={(e) => setNewFormData({ ...newFormData, male_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Wanita (P)</label>
              <input
                type="number"
                min="0"
                value={newFormData.female_count}
                onChange={(e) => setNewFormData({ ...newFormData, female_count: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Kamar</label>
              <input
                type="number"
                min="1"
                value={newFormData.total_rooms_requested}
                onChange={(e) => setNewFormData({ ...newFormData, total_rooms_requested: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Facility Requirements & Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Kebutuhan Fasilitas & Catatan</label>
            <textarea
              rows={2}
              placeholder="Contoh: Butuh Aula Cenderawasih untuk pembekalan dan Lapangan Manasik..."
              value={newFormData.notes}
              onChange={(e) => setNewFormData({ ...newFormData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsNewModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Reservasi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={verifyModal.isOpen}
        onClose={() => setVerifyModal({ isOpen: false, isApprove: true })}
        onConfirm={handleConfirmVerification}
        title={verifyModal.isApprove ? 'Verifikasi & Setujui Reservasi' : 'Tolak Reservasi'}
        message={
          verifyModal.isApprove
            ? `Apakah Anda ingin menyetujui reservasi ${verifyModal.reservation?.reservation_no}? Status akan menjadi CONFIRMED dan siap ditempatkan kamar.`
            : `Apakah Anda ingin menolak reservasi ${verifyModal.reservation?.reservation_no}?`
        }
        confirmText={verifyModal.isApprove ? 'Setujui Reservasi' : 'Tolak Permohonan'}
        variant={verifyModal.isApprove ? 'primary' : 'danger'}
      />

      {/* SPMA & Tag Bagasi Modal Munakosah */}
      {spmaTarget && (
        <SpmaModal
          isOpen={!!spmaTarget}
          onClose={() => setSpmaTarget(null)}
          reservation={spmaTarget}
          guest={guests.find((g) => g.id === spmaTarget.guest_id)}
          room={(() => {
            const assign = roomAssignments.find((a) => a.reservation_id === spmaTarget.id);
            return rooms.find((r) => r.id === assign?.room_id) || rooms[0];
          })()}
          bed={(() => {
            const assign = roomAssignments.find((a) => a.reservation_id === spmaTarget.id);
            return beds.find((b) => b.id === assign?.bed_id) || beds[0];
          })()}
          building={(() => {
            const assign = roomAssignments.find((a) => a.reservation_id === spmaTarget.id);
            const r = rooms.find((rm) => rm.id === assign?.room_id) || rooms[0];
            return buildings.find((b) => b.id === r?.building_id) || buildings[0];
          })()}
        />
      )}
    </div>
  );
};
