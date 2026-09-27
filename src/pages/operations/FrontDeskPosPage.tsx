import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, Search, BedDouble, Plus, Minus, Trash2, CheckCircle2, 
  CreditCard, Banknote, QrCode, ArrowRight, User, Phone, Building, 
  Calendar, Key, Clock, ShieldCheck, Printer, RefreshCw, Sparkles, 
  Hotel, Utensils, Coffee, Briefcase, DollarSign, LogOut, ChevronRight
} from 'lucide-react';
import { db } from '../../db/database';
import { Room, Building as BuildingType, RoomType, Guest, RateItem, Reservation, RoomAssignment, Invoice, Payment } from '../../types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ThermalReceiptModal, PosReceiptData } from '../../components/operations/ThermalReceiptModal';
import { SpmaModal } from '../../components/operations/SpmaModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDateIndo, formatDateTimeIndo, calculateNights } from '../../utils/formatters';

interface FrontDeskPosPageProps {
  onNavigate: (page: string, targetId?: string) => void;
}

interface CartItem {
  id: string;
  type: 'ROOM' | 'SERVICE';
  name: string;
  subtitle?: string;
  category: string;
  unitPrice: number;
  qty: number;
  roomId?: string;
  bedId?: string;
  notes?: string;
}

export const FrontDeskPosPage: React.FC<FrontDeskPosPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const toast = useToast();

  // Master and Operational Data
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<BuildingType[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rates, setRates] = useState<RateItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Filter & Search
  const [activeTab, setActiveTab] = useState<'ALL' | 'ROOMS' | 'FNB' | 'SERVICES' | 'FACILITY' | 'IN_HOUSE'>('ALL');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('all');
  const [catalogSearch, setCatalogSearch] = useState<string>('');

  // Front Desk POS Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [guestMode, setGuestMode] = useState<'NEW' | 'EXISTING'>('NEW');
  const [existingGuestId, setExistingGuestId] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestNik, setGuestNik] = useState<string>('');
  const [guestInstitution, setGuestInstitution] = useState<string>('Pribadi / Umum');
  
  // Dates & Occupancy
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [checkinDate, setCheckinDate] = useState<string>(todayStr);
  const [checkoutDate, setCheckoutDate] = useState<string>(tomorrowStr);
  const [cardKeys, setCardKeys] = useState<number>(1);
  const [hasDeposit, setHasDeposit] = useState<boolean>(true);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [posNotes, setPosNotes] = useState<string>('Transaksi Counter Kasir Front Desk');

  // Payment Settlement
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER' | 'SIMPONI'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Thermal Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);
  const [posReceiptData, setPosReceiptData] = useState<PosReceiptData | null>(null);

  // SPMA Modal State
  const [spmaModalOpen, setSpmaModalOpen] = useState<boolean>(false);
  const [createdRsv, setCreatedRsv] = useState<Reservation | null>(null);

  // Load all database state
  const loadData = () => {
    setRooms(db.getRooms());
    setBuildings(db.getBuildings());
    setRoomTypes(db.getRoomTypes());
    setGuests(db.getGuests());
    setRates(db.getRates());
    setReservations(db.getReservations());
    setAssignments(db.getRoomAssignments());
    setPayments(db.getPayments());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stay duration
  const stayNights = useMemo(() => {
    return calculateNights(checkinDate, checkoutDate);
  }, [checkinDate, checkoutDate]);

  // Available Rooms (Siap Huni)
  const availableRooms = useMemo(() => {
    return rooms.filter((r) => r.status === 'AVAILABLE');
  }, [rooms]);

  // In-House Guests (Tamu Sedang Menginap)
  const inHouseReservations = useMemo(() => {
    return reservations.filter((r) => r.status === 'CHECKED_IN');
  }, [reservations]);

  // Preset Extra POS Catalog Items (F&B, Services, Facilities)
  const presetCatalogItems: CartItem[] = useMemo(() => {
    return [
      {
        id: 'svc-extrabed',
        type: 'SERVICE',
        name: 'Extra Bed (Kasur Tambahan Lipat)',
        subtitle: 'Lengkap dengan sprei, bantal & selimut',
        category: 'SERVICES',
        unitPrice: 75000,
        qty: 1,
      },
      {
        id: 'fnb-prasmanan',
        type: 'SERVICE',
        name: 'Makan Prasmanan Haji (1x Makan)',
        subtitle: 'Menu syar’i lengkap 4 sehat 5 sempurna',
        category: 'FNB',
        unitPrice: 45000,
        qty: 1,
      },
      {
        id: 'fnb-nasikotak',
        type: 'SERVICE',
        name: 'Nasi Kotak Higienis (Box)',
        subtitle: 'Ayam bakar / rendang + buah & air',
        category: 'FNB',
        unitPrice: 35000,
        qty: 1,
      },
      {
        id: 'fnb-coffeebreak',
        type: 'SERVICE',
        name: 'Snack & Coffee Break (2 Kue)',
        subtitle: 'Teh manis, kopi panas, & 2 varian kue',
        category: 'FNB',
        unitPrice: 20000,
        qty: 1,
      },
      {
        id: 'fnb-galon',
        type: 'SERVICE',
        name: 'Air Mineral Galon Baru',
        subtitle: 'Air minum higienis jemaah asrama',
        category: 'FNB',
        unitPrice: 20000,
        qty: 1,
      },
      {
        id: 'svc-laundry',
        type: 'SERVICE',
        name: 'Laundry Kilat Jemaah (Cuci Gosok)',
        subtitle: 'Per 5 kg pakaian haji / kedinasan',
        category: 'SERVICES',
        unitPrice: 25000,
        qty: 1,
      },
      {
        id: 'svc-shuttle',
        type: 'SERVICE',
        name: 'Shuttle Antar-Jemput Bandara Sentani',
        subtitle: 'Mobil operasional UPT Asrama Haji Papua',
        category: 'SERVICES',
        unitPrice: 150000,
        qty: 1,
      },
      {
        id: 'fac-aula',
        type: 'SERVICE',
        name: 'Sewa Aula Cenderawasih (Harian)',
        subtitle: 'Kapasitas 800 orang + AC & Sound',
        category: 'FACILITY',
        unitPrice: 3500000,
        qty: 1,
      },
      {
        id: 'fac-rapat-vip',
        type: 'SERVICE',
        name: 'Sewa Ruang Rapat VIP Sentani',
        subtitle: 'Kapasitas 40 orang + Smart TV 75"',
        category: 'FACILITY',
        unitPrice: 1500000,
        qty: 1,
      },
    ];
  }, []);

  // Today's Cash Drawer & Shift Stats
  const shiftStats = useMemo(() => {
    // Payments today
    const todayPayments = payments.filter((p) => p.payment_date && p.payment_date.startsWith(todayStr));
    const cashTotal = todayPayments
      .filter((p) => p.payment_method === 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);
    const nonCashTotal = todayPayments
      .filter((p) => p.payment_method !== 'CASH')
      .reduce((sum, p) => sum + p.amount, 0);

    const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;

    return {
      cashTotal,
      nonCashTotal,
      occupiedCount,
      availableCount,
      todayTransCount: todayPayments.length,
    };
  }, [payments, rooms, todayStr]);

  // Cart operations
  const handleAddRoomToCart = (room: Room) => {
    // Check if already in cart
    if (cart.some((item) => item.roomId === room.id)) {
      toast.info('Kamar Sudah Terpilih', `Kamar ${room.room_number} sudah aktif di keranjang kasir.`);
      return;
    }

    const b = buildings.find((bld) => bld.id === room.building_id);
    const rt = roomTypes.find((t) => t.id === room.room_type_id);
    const availableBed = db.getBeds().find((bed) => bed.room_id === room.id && bed.status === 'AVAILABLE');

    const newItem: CartItem = {
      id: `cart-room-${room.id}`,
      type: 'ROOM',
      name: `Kamar ${room.room_number} (${rt?.name || 'Standar'})`,
      subtitle: `${b?.name || 'Gedung Asrama'} &bull; Lantai ${room.floor_id ? 'Lt. 1' : '1'} &bull; Kapasitas ${room.capacity} Bed`,
      category: 'ROOMS',
      unitPrice: room.rate_per_night,
      qty: stayNights,
      roomId: room.id,
      bedId: availableBed?.id,
    };

    // Swap out any previous room so 1 room allocation is assigned per walkin transaction
    setCart((prev) => {
      const withoutRoom = prev.filter((item) => item.type !== 'ROOM');
      return [newItem, ...withoutRoom];
    });
    toast.success('Kamar Ditambahkan', `Kamar ${room.room_number} berhasil dimasukkan ke keranjang kasir.`);
  };

  // Selected room currently in cart
  const selectedRoomInCart = useMemo(() => {
    return cart.find((i) => i.type === 'ROOM');
  }, [cart]);

  // Direct selection from cashier dropdown
  const handleSelectRoomFromDropdown = (roomId: string) => {
    if (!roomId) {
      setCart((prev) => prev.filter((item) => item.type !== 'ROOM'));
      return;
    }
    const target = rooms.find((r) => r.id === roomId);
    if (target) {
      handleAddRoomToCart(target);
    }
  };

  const handleAddServiceToCart = (service: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === service.id);
      if (existing) {
        return prev.map((i) => i.id === service.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...service, qty: 1 }];
    });
    toast.success('Layanan Ditambahkan', `${service.name} dimasukkan ke transaksi kasir.`);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleClearCart = () => {
    if (confirm('Kosongkan keranjang transaksi kasir saat ini?')) {
      setCart([]);
      setCashTendered(0);
    }
  };

  // Keep room quantities synced with stayNights
  useEffect(() => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.type === 'ROOM') {
          return { ...item, qty: stayNights };
        }
        return item;
      })
    );
  }, [stayNights]);

  // Existing Guest Autocomplete selection
  const handleSelectExistingGuest = (guestId: string) => {
    setExistingGuestId(guestId);
    const gst = guests.find((g) => g.id === guestId);
    if (gst) {
      setGuestName(gst.full_name);
      setGuestPhone(gst.phone || '');
      setGuestNik(gst.nik || '');
      setGuestInstitution(gst.notes || 'Tamu Terdaftar');
    }
  };

  // Financial Computations
  const subtotalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  }, [cart]);

  const activeDeposit = hasDeposit ? depositAmount : 0;
  const grandTotal = Math.max(0, subtotalItems + activeDeposit - discountAmount);

  // Auto set cash tendered to exact amount if 0 or less
  useEffect(() => {
    if (paymentMethod === 'CASH' && (cashTendered === 0 || cashTendered < grandTotal)) {
      setCashTendered(grandTotal);
    }
  }, [grandTotal, paymentMethod]);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== 'CASH') return 0;
    return Math.max(0, cashTendered - grandTotal);
  }, [cashTendered, grandTotal, paymentMethod]);

  // Execute Front Desk Transaction
  const handleExecuteTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      toast.warning('Nama Tamu Diperlukan', 'Silakan masukkan nama tamu pemesan.');
      return;
    }

    if (cart.length === 0) {
      toast.warning('Keranjang Kosong', 'Pilih minimal satu kamar atau layanan untuk diproses.');
      return;
    }

    const roomItem = cart.find((i) => i.type === 'ROOM');
    if (!roomItem || !roomItem.roomId) {
      toast.warning('Pilih Kamar Menginap', 'Silakan pilih kamar pada menu dropdown "Alokasi Kamar Menginap" atau klik salah satu kamar pada rak di sebelah kiri.');
      return;
    }

    const targetRoom = rooms.find((r) => r.id === roomItem.roomId);
    if (!targetRoom) {
      toast.error('Error', 'Data kamar tidak ditemukan.');
      return;
    }

    const targetBed = db.getBeds().find((b) => b.room_id === targetRoom.id && b.status === 'AVAILABLE') || db.getBeds().find((b) => b.room_id === targetRoom.id);
    if (!targetBed) {
      toast.error('Error', 'Tidak ada tempat tidur tersedia di kamar tersebut.');
      return;
    }

    const mappedPaymentMethod = 
      paymentMethod === 'TRANSFER' ? 'TRANSFER_BSI' :
      paymentMethod === 'SIMPONI' ? 'TRANSFER_BSI' :
      paymentMethod;

    const currentUserObj: any = currentUser || {
      id: 'usr-003',
      name: 'Resepsionis',
      role: 'RESEPSIONIS',
      username: 'resepsionis',
      email: 'frontdesk@asramahaji-papua.go.id',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };

    // Call Walk-in Checkin in database
    const result = db.createWalkInCheckin({
      guest: {
        fullName: guestName,
        phone: guestPhone || '0812-4820-0000',
        nik: guestNik || '917101' + Math.floor(Math.random() * 10000000000),
        gender: 'L',
        guestType: 'UMUM',
        regencyCity: 'Kota Jayapura',
        institutionName: guestInstitution,
      },
      roomId: targetRoom.id,
      bedId: targetBed.id,
      nights: stayNights,
      depositAmount: activeDeposit,
      cardKeys,
      initialPaymentAmount: grandTotal,
      paymentMethod: mappedPaymentMethod,
      notes: posNotes,
      user: currentUserObj,
    });

    if (result.success && result.reservation && result.invoice) {
      // If there are extra services in cart, add them as extra charges to the invoice
      const extraItems = cart.filter((i) => i.type === 'SERVICE');
      for (const extra of extraItems) {
        db.addExtraChargeToInvoice(
          result.invoice.id,
          `${extra.name} (${extra.qty}x)`,
          'SERVICE',
          extra.qty,
          extra.unitPrice,
          currentUserObj
        );
      }

      // Generate POS Receipt Data
      const bld = buildings.find((b) => b.id === targetRoom.building_id);
      const receiptNo = `POS/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`;

      const receiptData: PosReceiptData = {
        receiptNo,
        dateTime: formatDateTimeIndo(new Date().toISOString()),
        cashierName: currentUserObj.name || 'Resepsionis',
        guestName: guestName,
        institutionName: guestInstitution,
        phone: guestPhone,
        roomInfo: {
          roomNumber: targetRoom.room_number,
          buildingName: bld?.name || 'Gedung Asrama',
          bedName: targetBed.bed_code,
          checkinDate,
          checkoutDate,
          nights: stayNights,
        },
        items: cart.map((item) => ({
          name: item.name,
          qty: item.qty,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.qty,
        })),
        subtotal: subtotalItems,
        depositAmount: activeDeposit,
        discountAmount,
        totalAmount: grandTotal,
        paidAmount: paymentMethod === 'CASH' ? cashTendered : grandTotal,
        changeAmount,
        paymentMethod,
        simponiBillingCode: result.invoice.simponi_billing_code,
        cardKeysIssued: cardKeys,
      };

      setPosReceiptData(receiptData);
      setCreatedRsv(result.reservation);
      setReceiptModalOpen(true);
      toast.success('Transaksi Berhasil!', `Kamar ${targetRoom.room_number} telah check-in dan struk kasir diterbitkan.`);

      // Refresh master state
      loadData();
    } else {
      toast.error('Gagal Memproses Transaksi', result.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleResetForNew = () => {
    setCart([]);
    setGuestName('');
    setGuestPhone('');
    setGuestNik('');
    setGuestInstitution('Pribadi / Umum');
    setCashTendered(0);
    setReceiptModalOpen(false);
  };

  // Filter catalog items
  const filteredCatalogItems = useMemo(() => {
    let items = presetCatalogItems;

    if (activeTab === 'FNB') items = items.filter((i) => i.category === 'FNB');
    if (activeTab === 'SERVICES') items = items.filter((i) => i.category === 'SERVICES');
    if (activeTab === 'FACILITY') items = items.filter((i) => i.category === 'FACILITY');

    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || (i.subtitle || '').toLowerCase().includes(q));
    }
    return items;
  }, [presetCatalogItems, activeTab, catalogSearch]);

  const filteredRooms = useMemo(() => {
    let rList = availableRooms;
    if (selectedBuildingId !== 'all') {
      rList = rList.filter((r) => r.building_id === selectedBuildingId);
    }
    if (catalogSearch.trim()) {
      const q = catalogSearch.toLowerCase();
      rList = rList.filter((r) => r.room_number.toLowerCase().includes(q));
    }
    return rList;
  }, [availableRooms, selectedBuildingId, catalogSearch]);

  return (
    <div className="space-y-4">
      {/* Top Banner: Shift & Cash Drawer Tracker */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-emerald-800/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 tracking-wider">
                FRONT DESK POS
              </span>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                Kasir & Transaksi Resepsionis
              </h1>
            </div>
            <p className="text-xs text-emerald-200/90 mt-1">
              Petugas Kasir: <strong className="text-white">{currentUser?.name || 'Resepsionis'}</strong> &bull; Peran: <strong className="text-amber-300">Front Desk / Resepsionis</strong> &bull; Waktu: {formatDateIndo(todayStr)}
            </p>
          </div>

          {/* Quick Shift Metrik Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:w-auto text-xs">
            <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
              <p className="text-[10px] text-emerald-200 font-medium">Kas Tunai di Laci</p>
              <p className="text-sm font-black text-amber-300 font-mono">{formatCurrency(shiftStats.cashTotal)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
              <p className="text-[10px] text-emerald-200 font-medium">Non-Tunai / Bank</p>
              <p className="text-sm font-black text-white font-mono">{formatCurrency(shiftStats.nonCashTotal)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
              <p className="text-[10px] text-emerald-200 font-medium">Kamar Siap Huni</p>
              <p className="text-sm font-black text-emerald-400 font-mono">{shiftStats.availableCount} Kamar</p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/10">
              <p className="text-[10px] text-emerald-200 font-medium">Tamu Menginap</p>
              <p className="text-sm font-black text-blue-300 font-mono">{shiftStats.occupiedCount} Kamar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Catalog / Quick Room Rack / Add-ons (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Catalog Navigation Tabs */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'ALL' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setActiveTab('ROOMS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    activeTab === 'ROOMS' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  Kamar Kosong ({availableRooms.length})
                </button>
                <button
                  onClick={() => setActiveTab('FNB')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    activeTab === 'FNB' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  Konsumsi & F&B
                </button>
                <button
                  onClick={() => setActiveTab('SERVICES')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    activeTab === 'SERVICES' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Layanan Asrama
                </button>
                <button
                  onClick={() => setActiveTab('FACILITY')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    activeTab === 'FACILITY' ? 'bg-emerald-800 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  Sewa Aula
                </button>
                <button
                  onClick={() => setActiveTab('IN_HOUSE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    activeTab === 'IN_HOUSE' ? 'bg-blue-800 text-white shadow-xs' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <Hotel className="w-3.5 h-3.5" />
                  Tamu In-House ({inHouseReservations.length})
                </button>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kamar / item..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Building filter chip if tab is ALL or ROOMS */}
            {(activeTab === 'ALL' || activeTab === 'ROOMS') && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 overflow-x-auto">
                <span className="font-semibold text-slate-700 shrink-0">Filter Gedung:</span>
                <button
                  onClick={() => setSelectedBuildingId('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
                    selectedBuildingId === 'all' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100'
                  }`}
                >
                  Semua Gedung
                </button>
                {buildings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBuildingId(b.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
                      selectedBuildingId === b.id ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* VIEW TAB: IN-HOUSE GUESTS (Check-out & Add-on Folio directly from POS) */}
          {activeTab === 'IN_HOUSE' ? (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-blue-600" />
                  Daftar Tamu Menginap Saat Ini (In-House Folio & Quick Checkout)
                </h3>
                <span className="text-[11px] text-slate-500">{inHouseReservations.length} Tamu</span>
              </div>

              {inHouseReservations.length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">Tidak ada tamu yang sedang menginap saat ini.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inHouseReservations.map((rsv) => {
                    const rAssign = assignments.find((a) => a.reservation_id === rsv.id);
                    const roomObj = rooms.find((r) => r.id === rAssign?.room_id);
                    const guestObj = guests.find((g) => g.id === rsv.guest_id);

                    return (
                      <div key={rsv.id} className="p-3 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col justify-between text-xs space-y-2">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-blue-900">{rsv.reservation_no}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              Kamar {roomObj?.room_number || 'A101'}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 mt-1">{guestObj?.full_name || rsv.activity_name}</p>
                          <p className="text-[11px] text-slate-500">
                            Check-in: {formatDateIndo(rsv.checkin_date)} &bull; S/d: {formatDateIndo(rsv.checkout_date)}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-blue-200/50 flex items-center justify-between gap-2">
                          <button
                            onClick={() => onNavigate('invoices', rsv.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700"
                          >
                            + Tambah Folio
                          </button>
                          <button
                            onClick={() => onNavigate('checkout', rsv.id)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            Checkout & Refund &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* SECTION: AVAILABLE ROOMS */}
              {(activeTab === 'ALL' || activeTab === 'ROOMS') && (
                <div id="catalog-room-rack" className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 scroll-mt-24">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-emerald-800" />
                      Kamar Siap Huni ({filteredRooms.length} Kamar)
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md hidden sm:inline font-medium">
                        💡 Klik kartu kamar untuk memilih
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Durasi: {stayNights} Malam
                      </span>
                    </div>
                  </div>

                  {filteredRooms.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      Tidak ada kamar siap huni yang sesuai pencarian atau filter gedung.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {filteredRooms.map((room) => {
                        const bld = buildings.find((b) => b.id === room.building_id);
                        const rType = roomTypes.find((t) => t.id === room.room_type_id);
                        const isSelected = cart.some((i) => i.roomId === room.id);

                        return (
                          <div
                            key={room.id}
                            onClick={() => handleAddRoomToCart(room)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-600'
                                : 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-mono text-sm font-black text-slate-900">{room.room_number}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                                  {isSelected ? '✓ DIPILIH' : 'SIAP'}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-slate-600 truncate">{bld?.name || 'Gedung'}</p>
                              <p className="text-[10px] text-slate-400">{rType?.name || 'Kamar'} &bull; {room.capacity} Bed</p>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="font-bold text-emerald-900 font-mono">{formatCurrency(room.rate_per_night)}</span>
                              <span className="text-[10px] text-slate-400">/mlm</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: F&B, EXTRA SERVICES & AULA CATALOG */}
              {(activeTab === 'ALL' || activeTab === 'FNB' || activeTab === 'SERVICES' || activeTab === 'FACILITY') && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Layanan Tambahan, Konsumsi & Sewa Sarana ({filteredCatalogItems.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredCatalogItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleAddServiceToCart(item)}
                        className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                            {item.category === 'FNB' && <Utensils className="w-4 h-4" />}
                            {item.category === 'SERVICES' && <Sparkles className="w-4 h-4" />}
                            {item.category === 'FACILITY' && <Building className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold text-slate-900 font-mono">{formatCurrency(item.unitPrice)}</p>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            + Tambah
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN: CASHIER COUNTER TERMINAL (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-lg p-4 sm:p-5 sticky top-20 space-y-4">
          <form onSubmit={handleExecuteTransaction} className="space-y-4">
            
            {/* Header Kasir Keranjang */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-800" />
                <h2 className="font-black text-sm text-slate-900 tracking-tight">Terminal Kasir Resepsionis</h2>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[11px] text-rose-600 hover:underline font-semibold"
                >
                  Reset Keranjang
                </button>
              )}
            </div>

            {/* Quick Guest Form */}
            <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between pb-1">
                <span className="font-bold text-slate-800">Identitas Tamu Pemesan:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setGuestMode('NEW')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      guestMode === 'NEW' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Tamu Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestMode('EXISTING')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      guestMode === 'EXISTING' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Pilih Terdaftar
                  </button>
                </div>
              </div>

              {guestMode === 'EXISTING' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cari Tamu Terdaftar</label>
                  <select
                    value={existingGuestId}
                    onChange={(e) => handleSelectExistingGuest(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="">-- Pilih Tamu Terdaftar --</option>
                    {guests.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.full_name} ({g.phone || g.notes || 'Tamu'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Tamu / Jemaah..."
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">NIK / No. Porsi</label>
                  <input
                    type="text"
                    placeholder="9171xxxxxxxx / 3400xxxx"
                    value={guestNik}
                    onChange={(e) => setGuestNik(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Instansi / Kloter</label>
                  <input
                    type="text"
                    placeholder="Kemenag / Pribadi..."
                    value={guestInstitution}
                    onChange={(e) => setGuestInstitution(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              {/* Tanggal Menginap */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tgl Check-in</label>
                  <input
                    type="date"
                    required
                    value={checkinDate}
                    onChange={(e) => setCheckinDate(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[11px] bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Tgl Check-out</label>
                  <input
                    type="date"
                    required
                    value={checkoutDate}
                    onChange={(e) => setCheckoutDate(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-200 rounded-lg text-[11px] bg-white font-mono"
                  />
                </div>
              </div>

              {/* FITUR PILIH KAMAR: Alokasi Kamar Menginap Langsung di Terminal Kasir */}
              <div className="pt-2.5 border-t border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Pilih Kamar Menginap (Siap Huni) *</span>
                  </label>
                  {selectedRoomInCart ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      Kamar Terpilih
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Wajib Dipilih
                    </span>
                  )}
                </div>

                {/* Dropdown Langsung di Kasir */}
                <select
                  value={selectedRoomInCart?.roomId || ''}
                  onChange={(e) => handleSelectRoomFromDropdown(e.target.value)}
                  className={`w-full px-2.5 py-2 border rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedRoomInCart
                      ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500 font-bold'
                      : 'border-amber-400 bg-amber-50/70 text-slate-800 focus:ring-2 focus:ring-emerald-700 shadow-xs'
                  }`}
                >
                  <option value="">-- Klik untuk Pilih Kamar Siap Huni ({availableRooms.length} Kamar) --</option>
                  {availableRooms.map((rm) => {
                    const bld = buildings.find((b) => b.id === rm.building_id)?.name || 'Gedung';
                    const rType = roomTypes.find((t) => t.id === rm.room_type_id)?.name || 'Kamar';
                    return (
                      <option key={rm.id} value={rm.id}>
                        Kamar {rm.room_number} — {rType} ({bld}) — {formatCurrency(rm.rate_per_night)}/malam ({rm.capacity} Bed)
                      </option>
                    );
                  })}
                </select>

                {/* Info Status Kamar Terpilih atau Ajakan Pintasan ke Rak Kamar */}
                {selectedRoomInCart ? (
                  <div className="flex items-center justify-between text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-900 px-2.5 py-1.5 rounded-lg">
                    <div className="truncate">
                      <span className="font-bold">{selectedRoomInCart.name}</span>
                      <span className="text-[10px] text-emerald-700 ml-1.5 font-medium">
                        ({stayNights} Malam &bull; {formatCurrency(selectedRoomInCart.unitPrice * stayNights)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(selectedRoomInCart.id)}
                      className="text-rose-600 hover:text-rose-800 text-[10px] font-bold underline shrink-0 cursor-pointer ml-2"
                    >
                      Ganti / Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                    <span className="text-[10px] font-medium">Atau pilih dari rak kamar sebelah kiri:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('ROOMS');
                        const el = document.getElementById('catalog-room-rack');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 underline shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <span>Buka Rak Kamar</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Rincian Transaksi ({cart.length} Item)</span>
                <span className="text-[11px] text-slate-500">{stayNights} Malam</span>
              </div>

              {cart.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Keranjang kosong. Klik kamar atau layanan di sebelah kiri untuk menambah transaksi.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="truncate flex-1">
                        <p className="font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500">@{formatCurrency(item.unitPrice)}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.type !== 'ROOM' ? (
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="p-1 text-slate-500 hover:text-slate-800"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-1.5 font-bold font-mono text-[11px]">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="p-1 text-slate-500 hover:text-slate-800"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {item.qty} Malam
                          </span>
                        )}

                        <span className="font-mono font-bold text-slate-900 w-20 text-right">
                          {formatCurrency(item.unitPrice * item.qty)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deposit & Keycard Control */}
            <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-xs space-y-2 text-amber-950">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasDeposit}
                    onChange={(e) => setHasDeposit(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-700"
                  />
                  <span>Ambil Deposit Jaminan Kunci</span>
                </label>
                {hasDeposit && (
                  <input
                    type="number"
                    step="50000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-amber-300 rounded-lg text-xs font-mono font-bold text-right bg-white"
                  />
                )}
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-800">Jumlah Kunci Kartu Diberikan:</span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={cardKeys}
                  onChange={(e) => setCardKeys(parseInt(e.target.value) || 1)}
                  className="w-14 px-2 py-0.5 border border-amber-300 rounded text-center font-bold bg-white"
                />
              </div>
            </div>

            {/* Financial Settlement Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Item:</span>
                <span className="font-mono">{formatCurrency(subtotalItems)}</span>
              </div>
              {hasDeposit && (
                <div className="flex justify-between text-amber-800">
                  <span>Jaminan Kunci (Deposit):</span>
                  <span className="font-mono font-semibold">+{formatCurrency(depositAmount)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon:</span>
                  <span className="font-mono">-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="font-black text-sm text-slate-900">TOTAL BAYAR:</span>
                <span className="font-mono text-xl font-black text-emerald-900">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-1 border-t border-slate-200">
              <label className="block text-xs font-bold text-slate-800">Metode Pembayaran Kasir:</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tunai (Cash)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'QRIS'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'TRANSFER'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Bank (BSI)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('SIMPONI')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === 'SIMPONI'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>SIMPONI</span>
                </button>
              </div>

              {/* Cash Calculator Box if CASH selected */}
              {paymentMethod === 'CASH' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">Uang Diterima (Rp):</span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                      className="w-36 px-2.5 py-1.5 border border-emerald-300 rounded-lg text-sm font-mono font-black text-right bg-white"
                    />
                  </div>

                  {/* Preset Money Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setCashTendered(grandTotal)}
                      className="px-2 py-0.5 bg-white text-emerald-900 border border-emerald-300 rounded text-[10px] font-bold hover:bg-emerald-100"
                    >
                      Uang Pas
                    </button>
                    {[100000, 200000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashTendered(amt)}
                        className="px-2 py-0.5 bg-white text-emerald-900 border border-emerald-300 rounded text-[10px] font-bold hover:bg-emerald-100"
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200 font-bold">
                    <span className="text-emerald-900">Uang Kembalian:</span>
                    <span className="font-mono text-sm text-emerald-950 font-black">
                      {formatCurrency(changeAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Execute Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full py-3.5 text-sm font-black shadow-lg bg-emerald-700 hover:bg-emerald-800 tracking-wide uppercase"
              icon={<Receipt className="w-5 h-5 text-amber-300" />}
              disabled={cart.length === 0 || !guestName.trim()}
            >
              ⚡ Proses Transaksi & Check-in (F9)
            </Button>
          </form>
        </div>
      </div>

      {/* POS Thermal Receipt Modal (58mm/80mm) */}
      {posReceiptData && (
        <ThermalReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          data={posReceiptData}
          onNewTransaction={handleResetForNew}
          onViewSpma={() => {
            setReceiptModalOpen(false);
            setSpmaModalOpen(true);
          }}
        />
      )}

      {/* Munakosah SPMA Modal */}
      {createdRsv && (
        <SpmaModal
          isOpen={spmaModalOpen}
          onClose={() => setSpmaModalOpen(false)}
          reservation={createdRsv}
          guest={guests.find((g) => g.id === createdRsv.guest_id)}
          room={(() => {
            const assign = assignments.find((a) => a.reservation_id === createdRsv.id);
            return rooms.find((r) => r.id === assign?.room_id) || rooms[0];
          })()}
          bed={(() => {
            const assign = assignments.find((a) => a.reservation_id === createdRsv.id);
            return db.getBeds().find((b) => b.id === assign?.bed_id) || db.getBeds()[0];
          })()}
          building={(() => {
            const assign = assignments.find((a) => a.reservation_id === createdRsv.id);
            const r = rooms.find((rm) => rm.id === assign?.room_id) || rooms[0];
            return buildings.find((b) => b.id === r?.building_id) || buildings[0];
          })()}
        />
      )}
    </div>
  );
};
