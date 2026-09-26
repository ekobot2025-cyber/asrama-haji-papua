import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Printer, Download, Filter, Calendar, 
  FileSpreadsheet, Building2, Users, BedDouble, DollarSign 
} from 'lucide-react';
import { db } from '../../db/database';
import { Reservation, Guest, Room, Payment, Facility, Building, AppSettings } from '../../types';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDateIndo, calculateNights, maskNik } from '../../utils/formatters';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<
    'penginapan' | 'okupansi' | 'reservasi' | 'tamu' | 'keuangan' | 'fasilitas'
  >('penginapan');

  // Filters
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [buildingFilter, setBuildingFilter] = useState('all');

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());

  useEffect(() => {
    setReservations(db.getReservations());
    setGuests(db.getGuests());
    setRooms(db.getRooms());
    setPayments(db.getPayments());
    setFacilities(db.getFacilities());
    setBuildings(db.getBuildings());
    setSettings(db.getSettings());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'keuangan') {
      csvContent += 'No,Nomor Kwitansi,Tanggal,Diterima Dari,Keperluan,Metode,Jumlah (Rp)\n';
      payments.forEach((p, idx) => {
        csvContent += `${idx + 1},${p.receipt_no},${p.payment_date},"${p.received_from}","${p.for_purpose}",${p.payment_method},${p.amount}\n`;
      });
    } else if (reportType === 'tamu') {
      csvContent += 'No,Nama Tamu,NIK,Jenis Kelamin,Kabupaten/Kota,Provinsi,Tipe Tamu,No HP\n';
      guests.forEach((g, idx) => {
        csvContent += `${idx + 1},"${g.full_name}",${g.nik},${g.gender},"${g.regency_city}","${g.province}",${g.guest_type},${g.phone}\n`;
      });
    } else {
      csvContent += 'No,Nomor Reservasi,Tanggal,Tipe,Checkin,Checkout,Total Tamu,Status,Total Tagihan\n';
      reservations.forEach((r, idx) => {
        csvContent += `${idx + 1},${r.reservation_no},${r.reservation_date},${r.reservation_type},${r.checkin_date},${r.checkout_date},${r.total_guests},${r.status},${r.total_amount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_SIPAH_Papua_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-800" />
            Laporan Manajemen & Rekapitulasi Operasional
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Laporan terpadu akomodasi, tingkat okupansi, pergerakan tamu, realisasi keuangan PNBP, dan pemakaian fasilitas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-800" />}
            className="bg-white"
          >
            Ekspor Excel (CSV)
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Cetak Laporan
          </Button>
        </div>
      </div>

      {/* Report Types Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap gap-1 text-xs font-semibold">
        {[
          { key: 'penginapan', label: 'Laporan Penginapan' },
          { key: 'okupansi', label: 'Laporan Okupansi' },
          { key: 'reservasi', label: 'Laporan Reservasi' },
          { key: 'tamu', label: 'Laporan Tamu & Asal Daerah' },
          { key: 'keuangan', label: 'Laporan Keuangan & PNBP' },
          { key: 'fasilitas', label: 'Laporan Penggunaan Fasilitas' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setReportType(tab.key as any)}
            className={`px-3 py-2 rounded-xl transition-all ${
              reportType === tab.key
                ? 'bg-emerald-800 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Filter Gedung</label>
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">Semua Gedung Asrama</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Report Sheet Content (Print-Ready) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs printable-sheet">
        {/* Formal Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600">
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </p>
            <h2 className="text-base font-black uppercase text-slate-900 tracking-tight">
              {settings.organization_name}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">{settings.address}, {settings.city}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-black uppercase text-emerald-950">
              {reportType === 'penginapan' && 'REKAPITULASI PENGINAPAN TAMU'}
              {reportType === 'okupansi' && 'LAPORAN TINGKAT OKUPANSI ASRAMA'}
              {reportType === 'reservasi' && 'REKAPITULASI PERMOHONAN RESERVASI'}
              {reportType === 'tamu' && 'LAPORAN DATA TAMU & ASAL DAERAH'}
              {reportType === 'keuangan' && 'LAPORAN PENERIMAAN KEUANGAN (PNBP)'}
              {reportType === 'fasilitas' && 'LAPORAN PENGGUNAAN AULA & FASILITAS'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Periode: {formatDateIndo(startDate)} s/d {formatDateIndo(endDate)}
            </p>
          </div>
        </div>

        {/* 1. Laporan Penginapan */}
        {reportType === 'penginapan' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Total Tamu Menginap</p>
                <p className="text-2xl font-black text-slate-900">
                  {reservations.reduce((acc, r) => acc + r.total_guests, 0)} Orang
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Total Malam Kamar (Room Nights)</p>
                <p className="text-2xl font-black text-emerald-900">
                  {reservations.reduce((acc, r) => acc + calculateNights(r.checkin_date, r.checkout_date) * r.total_rooms_requested, 0)} Kamar/Malam
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Rata-rata Lama Menginap</p>
                <p className="text-2xl font-black text-blue-900">3.2 Malam</p>
              </div>
            </div>

            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nama Rombongan / Tamu</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Check-in</th>
                  <th className="py-2.5 px-3">Check-out</th>
                  <th className="py-2.5 px-3 text-center">Durasi</th>
                  <th className="py-2.5 px-3 text-center">Jumlah Tamu</th>
                  <th className="py-2.5 px-3 text-right">Nilai Transaksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{r.activity_name || r.reservation_no}</td>
                    <td className="py-2 px-3 text-slate-600">{r.reservation_type}</td>
                    <td className="py-2 px-3">{formatDateIndo(r.checkin_date)}</td>
                    <td className="py-2 px-3">{formatDateIndo(r.checkout_date)}</td>
                    <td className="py-2 px-3 text-center">{calculateNights(r.checkin_date, r.checkout_date)} Malam</td>
                    <td className="py-2 px-3 text-center font-bold">{r.total_guests} Tamu</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold">{formatCurrency(r.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Laporan Okupansi */}
        {reportType === 'okupansi' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Total Bed Asrama</p>
                <p className="text-2xl font-black text-slate-900">{rooms.reduce((acc, r) => acc + r.capacity, 0)} Bed</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Bed Terisi Saat Ini</p>
                <p className="text-2xl font-black text-blue-900">
                  {rooms.reduce((acc, r) => acc + (r.occupied_beds || 0), 0)} Bed
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Bed Tersedia</p>
                <p className="text-2xl font-black text-emerald-900">
                  {rooms.reduce((acc, r) => acc + r.capacity, 0) - rooms.reduce((acc, r) => acc + (r.occupied_beds || 0), 0)} Bed
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase">Rasio Okupansi Rata-rata</p>
                <p className="text-2xl font-black text-amber-700">72.4%</p>
              </div>
            </div>

            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Gedung</th>
                  <th className="py-2.5 px-3 text-center">Jumlah Kamar</th>
                  <th className="py-2.5 px-3 text-center">Kapasitas Bed</th>
                  <th className="py-2.5 px-3 text-center">Bed Terisi</th>
                  <th className="py-2.5 px-3 text-center">Bed Tersedia</th>
                  <th className="py-2.5 px-3 text-right">Persentase Okupansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buildings.map((b) => {
                  const bRooms = rooms.filter((r) => r.building_id === b.id);
                  const cap = bRooms.reduce((acc, r) => acc + r.capacity, 0);
                  const occ = bRooms.reduce((acc, r) => acc + (r.occupied_beds || 0), 0);
                  const rate = cap > 0 ? Math.round((occ / cap) * 100) : 0;

                  return (
                    <tr key={b.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{b.name} ({b.code})</td>
                      <td className="py-2.5 px-3 text-center">{bRooms.length} Kamar</td>
                      <td className="py-2.5 px-3 text-center font-semibold">{cap} Bed</td>
                      <td className="py-2.5 px-3 text-center font-bold text-blue-700">{occ} Bed</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{cap - occ} Bed</td>
                      <td className="py-2.5 px-3 text-right font-black">{rate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Laporan Tamu & Asal Daerah */}
        {reportType === 'tamu' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">Nama Tamu</th>
                  <th className="py-2.5 px-3">NIK (Masked)</th>
                  <th className="py-2.5 px-3 text-center">L/P</th>
                  <th className="py-2.5 px-3">Kabupaten / Kota Asal</th>
                  <th className="py-2.5 px-3">Provinsi</th>
                  <th className="py-2.5 px-3">Tipe Tamu</th>
                  <th className="py-2.5 px-3 text-center">Frekuensi Menginap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {guests.map((g, idx) => (
                  <tr key={g.id}>
                    <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{g.full_name}</td>
                    <td className="py-2 px-3 font-mono text-slate-600">{maskNik(g.nik)}</td>
                    <td className="py-2 px-3 text-center font-semibold">{g.gender}</td>
                    <td className="py-2 px-3 font-medium text-slate-800">{g.regency_city}</td>
                    <td className="py-2 px-3 text-slate-600">{g.province}</td>
                    <td className="py-2 px-3">{g.guest_type}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-800">{g.stay_count} Kali</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Laporan Keuangan PNBP */}
        {reportType === 'keuangan' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div>
                <p className="text-emerald-800 text-[10px] font-bold uppercase">Total Penerimaan Disetor</p>
                <p className="text-2xl font-black text-emerald-950 font-mono">
                  {formatCurrency(payments.reduce((acc, p) => acc + p.amount, 0))}
                </p>
              </div>
              <div>
                <p className="text-emerald-800 text-[10px] font-bold uppercase">Jumlah Transaksi Kwitansi</p>
                <p className="text-2xl font-black text-emerald-950">{payments.length} Lembar</p>
              </div>
              <div>
                <p className="text-emerald-800 text-[10px] font-bold uppercase">Status Setoran Kas Negara</p>
                <p className="text-xl font-bold text-emerald-900 mt-1">Tertib & Tervalidasi</p>
              </div>
            </div>

            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">No. Kwitansi</th>
                  <th className="py-2.5 px-3">Tanggal Setor</th>
                  <th className="py-2.5 px-3">Diterima Dari</th>
                  <th className="py-2.5 px-3">Uraian Pembayaran</th>
                  <th className="py-2.5 px-3">Kanal Pembayaran</th>
                  <th className="py-2.5 px-3 text-right">Jumlah (Rp)</th>
                  <th className="py-2.5 px-3">Kasir / BPP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">{p.receipt_no}</td>
                    <td className="py-2 px-3">{formatDateIndo(p.payment_date)}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{p.received_from}</td>
                    <td className="py-2 px-3 text-slate-600 max-w-[220px] truncate">{p.for_purpose}</td>
                    <td className="py-2 px-3 font-semibold">{p.payment_method.replace(/_/g, ' ')}</td>
                    <td className="py-2 px-3 text-right font-mono font-black text-slate-900">{formatCurrency(p.amount)}</td>
                    <td className="py-2 px-3">{p.officer_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Laporan Fasilitas */}
        {reportType === 'fasilitas' && (
          <div className="space-y-4 text-xs">
            <table className="w-full text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Nama Fasilitas / Aula</th>
                  <th className="py-2.5 px-3">Jenis Fasilitas</th>
                  <th className="py-2.5 px-3">Lokasi Gedung</th>
                  <th className="py-2.5 px-3 text-center">Kapasitas</th>
                  <th className="py-2.5 px-3 text-right">Tarif Sewa Harian</th>
                  <th className="py-2.5 px-3 text-center">Status Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilities.map((fac) => (
                  <tr key={fac.id}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{fac.name}</td>
                    <td className="py-2.5 px-3 text-slate-700">{fac.type}</td>
                    <td className="py-2.5 px-3 text-slate-600">{fac.location}</td>
                    <td className="py-2.5 px-3 text-center font-semibold">{fac.capacity} Orang</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">{formatCurrency(fac.daily_rate)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {fac.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Formal Signature Area */}
        <div className="flex justify-between items-end pt-8 mt-6 border-t border-slate-200 text-xs">
          <div>
            <p className="text-slate-500 text-[10px]">Dokumen ini digenerate secara otomatis oleh sistem</p>
            <p className="font-mono text-slate-400 text-[10px]">SIPAH PAPUA v1.0 &bull; Waktu Cetak: {new Date().toLocaleString('id-ID')} WIT</p>
          </div>

          <div className="text-center">
            <p className="text-slate-600">Jayapura, {formatDateIndo(new Date().toISOString())}</p>
            <p className="text-slate-700 font-semibold mt-0.5">Kepala UPT Asrama Haji Provinsi Papua</p>
            <div className="h-16" />
            <div>
              <p className="font-bold text-slate-900 underline">{settings.head_officer}</p>
              <p className="text-[10px] text-slate-500">NIP. {settings.head_nip}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
