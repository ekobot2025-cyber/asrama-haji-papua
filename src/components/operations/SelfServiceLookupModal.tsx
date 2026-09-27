import React, { useState } from 'react';
import { Search, BedDouble, Building, QrCode, CheckCircle2, AlertCircle, Printer, Tag, Sparkles, User, MapPin } from 'lucide-react';
import { db } from '../../db/database';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { SpmaModal } from './SpmaModal';
import { maskNik, formatDateIndo } from '../../utils/formatters';

interface SelfServiceLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SelfServiceLookupModal: React.FC<SelfServiceLookupModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSpmaOpen, setIsSpmaOpen] = useState(false);

  const handleSearch = (queryOverride?: string) => {
    const q = queryOverride !== undefined ? queryOverride : searchQuery;
    if (!q.trim()) return;

    setHasSearched(true);
    const result = db.lookupAccommodation(q);
    setSearchResult(result);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchResult(null);
    setHasSearched(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          handleReset();
          onClose();
        }}
        title="Anjungan Cek Kamar Mandiri Jemaah (Munakosah Papua)"
        subtitle="Cek nomor gedung, kamar, dan tempat tidur secara mandiri tanpa harus antre"
        maxWidth="xl"
      >
        <div className="space-y-5 text-xs text-slate-700">
          {/* Hero Banner Munakosah */}
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white p-4 rounded-2xl border border-emerald-800 shadow-xs relative overflow-hidden">
            <div className="relative z-10">
              <span className="bg-amber-400/20 text-amber-300 border border-amber-300/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                Layanan Cepat Satu Atap (One Stop Service)
              </span>
              <h3 className="text-base font-black tracking-tight text-white mb-1">
                Layanan Cek Penempatan Kamar & Tempat Tidur
              </h3>
              <p className="text-[11px] text-emerald-200 leading-relaxed max-w-lg">
                Masukkan NIK KTP, Nomor Porsi Haji, Nama Lengkap, atau Nomor Reservasi Anda untuk menemukan lokasi gedung dan tempat tidur Anda seketika.
              </p>
            </div>
            <Sparkles className="w-24 h-24 text-white/5 absolute -right-4 -bottom-4 pointer-events-none" />
          </div>

          {/* Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik NIK, Nama Tamu, No. HP, atau No. Reservasi..."
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 font-medium bg-slate-50"
                autoFocus
              />
            </div>
            <Button variant="primary" size="md" type="submit">
              Cari Kamar
            </Button>
          </form>

          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-semibold">Contoh Cepat:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Sulaiman');
                handleSearch('Sulaiman');
              }}
              className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors"
            >
              H. Sulaiman
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('Fatimah');
                handleSearch('Fatimah');
              }}
              className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors"
            >
              Hj. Siti Fatimah
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('RSV/AHP/2026/00001');
                handleSearch('RSV/AHP/2026/00001');
              }}
              className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors font-mono"
            >
              RSV-00001
            </button>
          </div>

          {/* Results Area */}
          {hasSearched && searchResult && (
            <div>
              {searchResult.found ? (
                <div className="border-2 border-emerald-800 rounded-2xl p-5 bg-white shadow-md space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      </span>
                      <div>
                        <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                          Data Akomodasi Ditemukan
                        </span>
                        <h4 className="text-base font-black text-slate-900 leading-tight">
                          {searchResult.guest?.full_name || 'Tamu Terdaftar'}
                        </h4>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {searchResult.reservation?.reservation_no}
                    </span>
                  </div>

                  {/* Highlights Room Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Gedung & Lantai
                      </span>
                      <Building className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                      <span className="font-extrabold text-slate-900 text-sm block">
                        {searchResult.building?.name || 'Gedung Akomodasi'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Kode: {searchResult.building?.code || 'BLD'}
                      </span>
                    </div>

                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block mb-1">
                        Nomor Kamar
                      </span>
                      <BedDouble className="w-5 h-5 text-emerald-800 mx-auto mb-1" />
                      <span className="font-black text-emerald-950 text-2xl block">
                        {searchResult.room?.room_number || 'A100'}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full inline-block mt-0.5">
                        {searchResult.room?.housekeeping_status || 'READY'}
                      </span>
                    </div>

                    <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-center">
                      <span className="text-[10px] text-amber-800 font-bold uppercase block mb-1">
                        Nomor Tempat Tidur
                      </span>
                      <Tag className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                      <span className="font-black text-amber-900 text-xl font-mono block">
                        {searchResult.bed?.bed_code || `${searchResult.room?.room_number || 'A100'}-B01`}
                      </span>
                      <span className="text-[10px] text-amber-800 block mt-0.5">
                        Tempat Tidur Pribadi
                      </span>
                    </div>
                  </div>

                  {/* Guest & Syariah Details */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Identitas NIK:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {searchResult.guest?.nik ? maskNik(searchResult.guest.nik) : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kategori Jemaah:</span>
                      <span className="font-bold text-slate-800">
                        {searchResult.guest?.guest_type || 'UMUM'} ({searchResult.guest?.gender === 'L' ? 'Ikhwan / L' : 'Akhwat / P'})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Asal Daerah:</span>
                      <span className="font-semibold text-slate-800">
                        {searchResult.guest?.regency_city || 'Papua'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Periode Menginap:</span>
                      <span className="font-semibold text-slate-800">
                        {searchResult.reservation?.checkin_date} s/d {searchResult.reservation?.checkout_date}
                      </span>
                    </div>
                  </div>

                  {/* Actions: View SPMA & Luggage Tag */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsSpmaOpen(true)}
                      icon={<Printer className="w-3.5 h-3.5" />}
                    >
                      Buka Dokumen SPMA & Label Bagasi
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <h4 className="font-bold text-rose-900 text-sm">Data Tidak Ditemukan</h4>
                  <p className="text-[11px] text-rose-700 max-w-sm mx-auto">
                    {searchResult.message || 'Harap periksa kembali NIK, nama lengkap, atau nomor reservasi yang Anda masukkan.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Linked SPMA Modal */}
      {searchResult?.reservation && (
        <SpmaModal
          isOpen={isSpmaOpen}
          onClose={() => setIsSpmaOpen(false)}
          reservation={searchResult.reservation}
          guest={searchResult.guest}
          room={searchResult.room}
          bed={searchResult.bed}
          building={searchResult.building}
        />
      )}
    </>
  );
};
