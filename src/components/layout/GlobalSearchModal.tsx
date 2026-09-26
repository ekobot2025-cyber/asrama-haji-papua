import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CalendarCheck, Users, Briefcase, BedDouble, FileText, ArrowRight } from 'lucide-react';
import { db } from '../../db/database';
import { formatCurrency, maskNik } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, targetId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const term = searchTerm.toLowerCase().trim();

  // Search through all entities in db
  const reservations = term
    ? db.getReservations().filter(
        (r) =>
          r.reservation_no.toLowerCase().includes(term) ||
          r.activity_name?.toLowerCase().includes(term) ||
          r.notes?.toLowerCase().includes(term)
      )
    : [];

  const guests = term
    ? db.getGuests().filter(
        (g) =>
          g.full_name.toLowerCase().includes(term) ||
          g.nik.includes(term) ||
          g.phone.includes(term) ||
          g.regency_city.toLowerCase().includes(term)
      )
    : [];

  const groups = term
    ? db.getGroups().filter(
        (grp) =>
          grp.group_name.toLowerCase().includes(term) ||
          grp.activity_name.toLowerCase().includes(term) ||
          grp.pic_name.toLowerCase().includes(term)
      )
    : [];

  const rooms = term
    ? db.getRooms().filter((rm) => rm.room_number.toLowerCase().includes(term))
    : [];

  const invoices = term
    ? db.getInvoices().filter(
        (inv) =>
          inv.invoice_no.toLowerCase().includes(term) ||
          inv.bill_to_name.toLowerCase().includes(term)
      )
    : [];

  const totalResults = reservations.length + guests.length + groups.length + rooms.length + invoices.length;

  const handleSelect = (page: string, targetId?: string) => {
    onNavigate(page, targetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-6 sm:pt-20">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 transition-all">
          {/* Search Input Box */}
          <div className="relative border-b border-slate-200 px-4 py-3 flex items-center gap-3">
            <Search className="w-5 h-5 text-emerald-800 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari nomor reservasi, nama tamu, rombongan, nomor kamar, invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 shrink-0">
              ESC
            </span>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {!term ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Ketik kata kunci untuk mencari di seluruh data Asrama Haji Papua.
              </div>
            ) : totalResults === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Tidak ditemukan hasil untuk <span className="font-semibold text-slate-800">"{searchTerm}"</span>
              </div>
            ) : (
              <>
                {/* Reservasi */}
                {reservations.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5" /> Reservasi ({reservations.length})
                    </h4>
                    <div className="space-y-1.5">
                      {reservations.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => handleSelect('reservations', r.id)}
                          className="p-2.5 rounded-xl hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{r.reservation_no}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                {r.status}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px] mt-0.5">{r.activity_name || r.reservation_type} &bull; {r.total_guests} Tamu</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tamu */}
                {guests.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Data Tamu ({guests.length})
                    </h4>
                    <div className="space-y-1.5">
                      {guests.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => handleSelect('guests', g.id)}
                          className="p-2.5 rounded-xl hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{g.full_name}</div>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              NIK: {maskNik(g.nik)} &bull; {g.phone} &bull; {g.regency_city}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rombongan */}
                {groups.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Rombongan ({groups.length})
                    </h4>
                    <div className="space-y-1.5">
                      {groups.map((grp) => (
                        <div
                          key={grp.id}
                          onClick={() => handleSelect('groups', grp.id)}
                          className="p-2.5 rounded-xl hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{grp.group_name}</div>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              PIC: {grp.pic_name} ({grp.pic_phone}) &bull; {grp.total_members} Peserta
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kamar */}
                {rooms.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5" /> Kamar ({rooms.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {rooms.map((rm) => (
                        <div
                          key={rm.id}
                          onClick={() => handleSelect('room-status-board', rm.id)}
                          className="p-2.5 rounded-xl hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">Kamar {rm.room_number}</div>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              Status: <span className="font-semibold">{rm.status}</span> ({rm.capacity} Bed)
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invoice */}
                {invoices.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Tagihan & Invoice ({invoices.length})
                    </h4>
                    <div className="space-y-1.5">
                      {invoices.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => handleSelect('invoices', inv.id)}
                          className="p-2.5 rounded-xl hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span>{inv.invoice_no}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                {inv.status}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px] mt-0.5">
                              {inv.bill_to_name} &bull; Total: {formatCurrency(inv.total_amount)}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-emerald-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
