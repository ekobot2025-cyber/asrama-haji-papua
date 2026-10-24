import type { 
  User, Building, Floor, RoomType, Room, Bed, Institution, Guest, Group, 
  Reservation, RoomAssignment, Checkin, Checkout, Facility, FacilityReservation, 
  RateItem, RateHistory, Invoice, InvoiceItem, Payment, HousekeepingTask, MaintenanceRequest, 
  NotificationItem, AuditLog, AppSettings, RoomStatus, HousekeepingStatus
} from '../types/index.ts';
import { 
  initialUsers, initialBuildings, initialFloors, initialRoomTypes, 
  initialInstitutions, initialGuests, initialGroups, initialReservations, 
  initialHousekeepingTasks, initialMaintenanceRequests, initialInvoices, 
  initialInvoiceItems, initialPayments, initialRates, initialNotifications, 
  initialAuditLogs, initialSettings, initialFacilities, generateSeedRoomsAndBeds 
} from './seedData.ts';
import { terbilang } from '../utils/terbilang.ts';

const DB_VERSION = 'simaha_papua_v4.0_gedung_mina_32kamar';
const STORAGE_PREFIX = 'sipah_';

class DatabaseService {
  private users: User[] = [];
  private buildings: Building[] = [];
  private floors: Floor[] = [];
  private roomTypes: RoomType[] = [];
  private rooms: Room[] = [];
  private beds: Bed[] = [];
  private institutions: Institution[] = [];
  private guests: Guest[] = [];
  private groups: Group[] = [];
  private reservations: Reservation[] = [];
  private roomAssignments: RoomAssignment[] = [];
  private checkins: Checkin[] = [];
  private checkouts: Checkout[] = [];
  private facilities: Facility[] = [];
  private facilityReservations: FacilityReservation[] = [];
  private rates: RateItem[] = [];
  private rateHistories: RateHistory[] = [];
  private invoices: Invoice[] = [];
  private invoiceItems: InvoiceItem[] = [];
  private payments: Payment[] = [];
  private housekeepingTasks: HousekeepingTask[] = [];
  private maintenanceRequests: MaintenanceRequest[] = [];
  private notifications: NotificationItem[] = [];
  private auditLogs: AuditLog[] = [];
  private settings: AppSettings = initialSettings;

  constructor() {
    this.initialize();
  }

  public initialize(forceReset = false): void {
    const currentVersion = localStorage.getItem(`${STORAGE_PREFIX}initialized`);

    if (!currentVersion || currentVersion !== DB_VERSION || forceReset) {
      this.seedDatabase();
    } else {
      this.loadFromStorage();
    }
  }

  public seedDatabase(): void {
    const { rooms, beds } = generateSeedRoomsAndBeds();

    this.users = [...initialUsers];
    this.buildings = [...initialBuildings];
    this.floors = [...initialFloors];
    this.roomTypes = [...initialRoomTypes];
    this.rooms = [...rooms];
    this.beds = [...beds];
    this.institutions = [...initialInstitutions];
    this.guests = [...initialGuests];
    this.groups = [...initialGroups];
    this.reservations = [...initialReservations];
    this.facilities = [...initialFacilities];
    this.rates = [...initialRates];
    this.invoices = [...initialInvoices];
    this.invoiceItems = [...initialInvoiceItems];
    this.payments = [...initialPayments];
    this.housekeepingTasks = [...initialHousekeepingTasks];
    this.maintenanceRequests = [...initialMaintenanceRequests];
    this.notifications = [...initialNotifications];
    this.auditLogs = [...initialAuditLogs];
    this.settings = { ...initialSettings };

    // Initial assignments for checked-in rooms (Gedung Mina)
    this.roomAssignments = [
      {
        id: 'ra-01',
        reservation_id: 'rsv-003',
        guest_id: 'gst-001',
        room_id: 'room-001', // M101 (Superior)
        bed_id: 'bed-room-001-1',
        assigned_at: '2026-09-25T14:00:00Z',
        assigned_by: 'Resepsionis',
        status: 'CHECKED_IN',
      },
      {
        id: 'ra-02',
        reservation_id: 'rsv-004',
        guest_id: 'gst-010',
        room_id: 'room-003', // M103 (Standar)
        bed_id: 'bed-room-003-1',
        assigned_at: '2026-09-25T14:15:00Z',
        assigned_by: 'Resepsionis',
        status: 'CHECKED_IN',
      },
      {
        id: 'ra-03',
        reservation_id: 'rsv-001',
        guest_id: 'gst-005',
        room_id: 'room-004', // M104 (Standar)
        bed_id: 'bed-room-004-1',
        assigned_at: '2026-09-25T14:30:00Z',
        assigned_by: 'Resepsionis',
        status: 'CHECKED_IN',
      },
      {
        id: 'ra-04',
        reservation_id: 'rsv-001',
        guest_id: 'gst-006',
        room_id: 'room-017', // M201 (Standar)
        bed_id: 'bed-room-017-1',
        assigned_at: '2026-09-25T14:30:00Z',
        assigned_by: 'Resepsionis',
        status: 'CHECKED_IN',
      },
    ];

    this.checkins = [
      {
        id: 'chk-01',
        reservation_id: 'rsv-001',
        checkin_no: 'CIN/2026/0001',
        checkin_time: '2026-09-25T14:30:00Z',
        checkin_by: 'Resepsionis',
        card_keys_issued: 8,
        deposit_amount: 500000,
        notes: 'Check-in rombongan Jamaah Haji Kloter 1 Kab. Jayapura',
      },
      {
        id: 'chk-02',
        reservation_id: 'rsv-003',
        checkin_no: 'CIN/2026/0002',
        checkin_time: '2026-09-25T15:00:00Z',
        checkin_by: 'Resepsionis',
        card_keys_issued: 1,
        deposit_amount: 100000,
        notes: 'Tamu VIP Kemenag Papua (Kamar Superior M101)',
      },
    ];

    this.checkouts = [
      {
        id: 'co-01',
        reservation_id: 'rsv-007',
        checkout_no: 'COUT/2026/0001',
        checkout_time: '2026-09-26T11:45:00Z',
        checkout_by: 'Resepsionis',
        room_condition_notes: 'Kamar M106 rapi, kunci kartu lengkap dikembalikan',
        deposit_returned: true,
        notes: 'Selesai menginap',
      },
    ];

    this.saveAll();
    localStorage.setItem(`${STORAGE_PREFIX}initialized`, DB_VERSION);
  }

  private saveAll(): void {
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(this.users));
    localStorage.setItem(`${STORAGE_PREFIX}buildings`, JSON.stringify(this.buildings));
    localStorage.setItem(`${STORAGE_PREFIX}floors`, JSON.stringify(this.floors));
    localStorage.setItem(`${STORAGE_PREFIX}roomTypes`, JSON.stringify(this.roomTypes));
    localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
    localStorage.setItem(`${STORAGE_PREFIX}institutions`, JSON.stringify(this.institutions));
    localStorage.setItem(`${STORAGE_PREFIX}guests`, JSON.stringify(this.guests));
    localStorage.setItem(`${STORAGE_PREFIX}groups`, JSON.stringify(this.groups));
    localStorage.setItem(`${STORAGE_PREFIX}reservations`, JSON.stringify(this.reservations));
    localStorage.setItem(`${STORAGE_PREFIX}roomAssignments`, JSON.stringify(this.roomAssignments));
    localStorage.setItem(`${STORAGE_PREFIX}checkins`, JSON.stringify(this.checkins));
    localStorage.setItem(`${STORAGE_PREFIX}checkouts`, JSON.stringify(this.checkouts));
    localStorage.setItem(`${STORAGE_PREFIX}facilities`, JSON.stringify(this.facilities));
    localStorage.setItem(`${STORAGE_PREFIX}rates`, JSON.stringify(this.rates));
    localStorage.setItem(`${STORAGE_PREFIX}rateHistories`, JSON.stringify(this.rateHistories));
    localStorage.setItem(`${STORAGE_PREFIX}invoices`, JSON.stringify(this.invoices));
    localStorage.setItem(`${STORAGE_PREFIX}invoiceItems`, JSON.stringify(this.invoiceItems));
    localStorage.setItem(`${STORAGE_PREFIX}payments`, JSON.stringify(this.payments));
    localStorage.setItem(`${STORAGE_PREFIX}housekeepingTasks`, JSON.stringify(this.housekeepingTasks));
    localStorage.setItem(`${STORAGE_PREFIX}maintenanceRequests`, JSON.stringify(this.maintenanceRequests));
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(this.notifications));
    localStorage.setItem(`${STORAGE_PREFIX}auditLogs`, JSON.stringify(this.auditLogs));
    localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(this.settings));
  }

  private loadFromStorage(): void {
    try {
      this.users = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}users`) || '[]') || initialUsers;
      this.buildings = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}buildings`) || '[]') || initialBuildings;
      this.floors = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}floors`) || '[]') || initialFloors;
      this.roomTypes = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}roomTypes`) || '[]') || initialRoomTypes;
      this.rooms = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}rooms`) || '[]') || [];
      this.beds = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}beds`) || '[]') || [];
      this.institutions = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}institutions`) || '[]') || initialInstitutions;
      this.guests = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}guests`) || '[]') || initialGuests;
      this.groups = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}groups`) || '[]') || initialGroups;
      this.reservations = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}reservations`) || '[]') || initialReservations;
      this.roomAssignments = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}roomAssignments`) || '[]') || [];
      this.checkins = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}checkins`) || '[]') || [];
      this.checkouts = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}checkouts`) || '[]') || [];
      this.facilities = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}facilities`) || '[]') || initialFacilities;
      this.rates = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}rates`) || '[]') || initialRates;
      this.rateHistories = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}rateHistories`) || '[]') || [];
      this.invoices = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}invoices`) || '[]') || initialInvoices;
      this.invoiceItems = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}invoiceItems`) || '[]') || initialInvoiceItems;
      this.payments = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}payments`) || '[]') || initialPayments;
      this.housekeepingTasks = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}housekeepingTasks`) || '[]') || initialHousekeepingTasks;
      this.maintenanceRequests = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}maintenanceRequests`) || '[]') || initialMaintenanceRequests;
      this.notifications = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}notifications`) || '[]') || initialNotifications;
      this.auditLogs = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}auditLogs`) || '[]') || initialAuditLogs;
      this.settings = JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}settings`) || '{}') || initialSettings;

      if (!this.rooms.length) {
        this.seedDatabase();
      } else {
        // Fallback migration to ensure all reservations have SPMA & package_type
        let needsSave = false;

        // Clean any existing dummy personal names from stored user accounts
        this.users.forEach(u => {
          if (u.username === 'superadmin') { u.name = 'Super Admin'; u.email = 'superadmin@asramahaji.id'; }
          else if (u.username === 'admin') { u.name = 'Admin Penginapan'; u.email = 'admin@asramahaji.id'; }
          else if (u.username === 'resepsionis') { u.name = 'Resepsionis'; u.role = 'RESEPSIONIS'; u.email = 'resepsionis@asramahaji.id'; }
          else if (u.username === 'keuangan') { u.name = 'Bendahara Keuangan'; u.email = 'keuangan@asramahaji.id'; }
          else if (u.username === 'housekeeping') { u.name = 'Housekeeping'; u.email = 'housekeeping@asramahaji.id'; }
          else if (u.username === 'pimpinan') { u.name = 'Pimpinan (Ka. UPT)'; u.email = 'pimpinan@asramahaji.id'; }
        });
        needsSave = true;

        // 1. RoomTypes: Superior & Standar official brochure specs
        this.roomTypes.forEach(rt => {
          if (rt.id === 'rt-spr' || rt.code === 'SUPERIOR') {
            rt.name = 'Superior';
            rt.category = 'PENGINAPAN';
            rt.base_rate_per_night = 300000;
            rt.base_rate = 300000;
            rt.default_capacity = 2;
            rt.capacity = 2;
            rt.rate_unit = 'PER_NIGHT';
            rt.amenities = ['Double Bed', 'AC', 'Meja', 'Lemari', 'Closet Duduk', 'Smart TV LED', 'Water Heater', 'WiFi Gratis'];
            if (!rt.image_url) rt.image_url = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600';
            needsSave = true;
          } else if (rt.id === 'rt-std' || rt.code === 'STANDAR') {
            rt.name = 'Standar';
            rt.category = 'PENGINAPAN';
            rt.base_rate_per_night = 250000;
            rt.base_rate = 250000;
            rt.default_capacity = 2;
            rt.capacity = 2;
            rt.rate_unit = 'PER_NIGHT';
            rt.amenities = ['2 Single Bed', 'AC', 'Meja', 'Lemari', 'Closet Duduk', 'WiFi Gratis'];
            if (!rt.image_url) rt.image_url = 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600';
            needsSave = true;
          }
        });

        // 2. Facilities: Aula (300 pax, Rp3.900.000) & Ruang Kelas (30 pax, Rp650.000)
        const aulaFac = this.facilities.find(f => f.id === 'fac-01' || f.name.toLowerCase().includes('aula'));
        if (aulaFac) {
          aulaFac.name = 'Aula';
          aulaFac.category = 'RUANG_PERTEMUAN';
          aulaFac.capacity = 300;
          aulaFac.daily_rate = 3900000;
          aulaFac.rate_unit = 'PER_DAY';
          aulaFac.amenities = ['Sound System', 'Infocus / Proyektor', 'AC', 'Kursi'];
          if (!aulaFac.image_url) aulaFac.image_url = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600';
          needsSave = true;
        }

        if (!this.facilities.some(f => f.id === 'fac-07' || f.name.toLowerCase().includes('ruang kelas'))) {
          this.facilities.push({
            id: 'fac-07',
            name: 'Ruang Kelas',
            type: 'RUANG_KELAS',
            category: 'RUANG_PERTEMUAN',
            location: 'Gedung Diklat Lantai 1',
            capacity: 30,
            daily_rate: 650000,
            hourly_rate: 100000,
            rate_unit: 'PER_DAY',
            status: 'AVAILABLE',
            description: 'Ruang kelas representatif untuk diklat, bimtek, pelatihan intensif, dan rapat teknis berkapasitas maksimal 30 orang.',
            amenities: ['Sound System', 'Infocus / Proyektor', 'AC', 'Kursi'],
            image_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600',
          });
          needsSave = true;
        }

        // 3. Rates: Update Aula rate to 3.900.000, add Ruang Kelas rate if missing
        const aulaRate = this.rates.find(r => r.id === 'rate-03' || r.name.toLowerCase().includes('aula'));
        if (aulaRate) {
          aulaRate.name = 'Tarif Sewa Aula';
          aulaRate.rate = 3900000;
          aulaRate.unit = 'PER_DAY';
          aulaRate.description = 'Tarif sewa Aula resmi brosur per hari (Kapasitas maks 300 orang, Sound System, Infocus/Proyektor, AC, Kursi)';
          needsSave = true;
        }

        if (!this.rates.some(r => r.id === 'rate-05' || r.name.toLowerCase().includes('ruang kelas'))) {
          this.rates.push({
            id: 'rate-05',
            name: 'Tarif Sewa Ruang Kelas',
            category: 'FASILITAS',
            target_id: 'fac-07',
            user_type: 'Instansi Pemerintah / Pelatihan / Diklat',
            unit: 'PER_DAY',
            rate: 650000,
            description: 'Tarif sewa Ruang Kelas resmi brosur per hari (Kapasitas maks 30 orang, Sound System, Infocus/Proyektor, AC, Kursi)',
            is_active: true,
            effective_date: '2026-01-01',
          });
          needsSave = true;
        }

        // 4. Update reservations with rental_category, duration, unit_count, and snapshot_rate if missing
        this.reservations.forEach((r, idx) => {
          if (!r.spma_no) {
            r.spma_no = `SPMA/AHP/2026/09/${String(idx + 1).padStart(4, '0')}`;
            needsSave = true;
          }
          if (!r.package_type) {
            r.package_type = 'REGULER';
            needsSave = true;
          }
          if (!r.rental_category) {
            r.rental_category = r.facility_requirements && !r.total_rooms_requested ? 'RUANG_PERTEMUAN' : 'PENGINAPAN';
            needsSave = true;
          }
          if (!r.unit_count) {
            r.unit_count = r.total_rooms_requested || 1;
            needsSave = true;
          }
          if (!r.duration_unit) {
            r.duration_unit = r.rental_category === 'PENGINAPAN' ? 'MALAM' : 'HARI';
            needsSave = true;
          }
          if (!r.duration) {
            const cin = new Date(r.checkin_date).getTime();
            const cout = new Date(r.checkout_date).getTime();
            const diffDays = Math.max(1, Math.round((cout - cin) / (1000 * 60 * 60 * 24)));
            r.duration = diffDays;
            needsSave = true;
          }
          if (!r.snapshot_rate) {
            const nights = r.duration || 1;
            const units = r.unit_count || 1;
            r.snapshot_rate = Math.round(r.total_amount / (nights * units)) || 250000;
            needsSave = true;
          }
        });

        // Fallback migration to ensure all invoices have PNBP and SIMPONI
        this.invoices.forEach((inv, idx) => {
          if (!inv.pnbp_account_code) {
            inv.pnbp_account_code = inv.total_amount > 5000000 ? '425111' : '425112';
            inv.pnbp_account_name = inv.pnbp_account_code === '425111' 
              ? 'Pendapatan Sewa Gedung, Bangunan, Ruangan & Fasilitas Aula'
              : 'Pendapatan Sewa Kamar / Asrama / Wisma (PP No. 59/2020)';
            needsSave = true;
          }
          if (!inv.simponi_billing_code) {
            inv.simponi_billing_code = `820260926${String(idx + 1).padStart(5, '0')}`;
            inv.billing_expired_at = '2026-09-30T23:59:59Z';
            needsSave = true;
          }
          if (!inv.spk_contract_no && inv.pnbp_account_code === '425111') {
            inv.spk_contract_no = `SPK/AHP/KS/2026/${String(idx + 1).padStart(3, '0')}`;
            needsSave = true;
          }
        });

        if (needsSave) {
          this.saveAll();
        }
      }
    } catch {
      this.seedDatabase();
    }
  }

  // --- Audit Logging ---
  public logAudit(userName: string, userRole: string, action: string, module: string, details: string, targetId?: string): void {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_name: userName,
      user_role: userRole,
      action,
      module,
      target_id: targetId,
      details,
      ip_address: '192.168.1.' + Math.floor(Math.random() * 50 + 10),
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    localStorage.setItem(`${STORAGE_PREFIX}auditLogs`, JSON.stringify(this.auditLogs));
  }

  // --- Notifications ---
  public addNotification(title: string, message: string, type: NotificationItem['type'], linkPage?: string, linkId?: string): void {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      is_read: false,
      link_page: linkPage,
      link_id: linkId,
      created_at: new Date().toISOString(),
    };
    this.notifications.unshift(newNotif);
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(this.notifications));
  }

  public markNotificationAsRead(id: string): void {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(this.notifications));
  }

  public markAllNotificationsAsRead(): void {
    this.notifications = this.notifications.map(n => ({ ...n, is_read: true }));
    localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(this.notifications));
  }

  // --- Getters ---
  public getUsers(): User[] { return [...this.users]; }
  public getBuildings(): Building[] { return [...this.buildings]; }
  public getFloors(): Floor[] { return [...this.floors]; }
  public getRoomTypes(): RoomType[] { return [...this.roomTypes]; }
  public getRooms(): Room[] { return [...this.rooms]; }
  public getBeds(): Bed[] { return [...this.beds]; }
  public getInstitutions(): Institution[] { return [...this.institutions]; }
  public getGuests(): Guest[] { return [...this.guests]; }
  public getGroups(): Group[] { return [...this.groups]; }
  public getReservations(): Reservation[] { return [...this.reservations]; }
  public getRoomAssignments(): RoomAssignment[] { return [...this.roomAssignments]; }
  public getCheckins(): Checkin[] { return [...this.checkins]; }
  public getCheckouts(): Checkout[] { return [...this.checkouts]; }
  public getFacilities(): Facility[] { return [...this.facilities]; }
  public getRates(): RateItem[] { return [...this.rates]; }
  public getRateHistories(): RateHistory[] { return [...this.rateHistories]; }
  public getInvoices(): Invoice[] { return [...this.invoices]; }
  public getInvoiceItems(): InvoiceItem[] { return [...this.invoiceItems]; }
  public getPayments(): Payment[] { return [...this.payments]; }
  public getHousekeepingTasks(): HousekeepingTask[] { return [...this.housekeepingTasks]; }
  public getMaintenanceRequests(): MaintenanceRequest[] { return [...this.maintenanceRequests]; }
  public getNotifications(): NotificationItem[] { return [...this.notifications]; }
  public getAuditLogs(): AuditLog[] { return [...this.auditLogs]; }
  public getSettings(): AppSettings { return { ...this.settings }; }

  // --- Rooms & Beds Operations ---
  public updateRoomStatus(roomId: string, status: RoomStatus, hkStatus?: HousekeepingStatus, notes?: string): void {
    this.rooms = this.rooms.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          status,
          housekeeping_status: hkStatus || r.housekeeping_status,
          notes: notes !== undefined ? notes : r.notes,
          updated_at: new Date().toISOString(),
        };
      }
      return r;
    });

    // Update beds status accordingly
    if (status === 'AVAILABLE') {
      this.beds = this.beds.map(b => b.room_id === roomId ? { ...b, status: 'AVAILABLE', current_guest_id: undefined } : b);
    } else if (status === 'MAINTENANCE') {
      this.beds = this.beds.map(b => b.room_id === roomId ? { ...b, status: 'MAINTENANCE' } : b);
    }

    // Sync with housekeeping task if present
    const hkTask = this.housekeepingTasks.find(t => t.room_id === roomId);
    if (hkTask) {
      if (hkStatus) hkTask.status = hkStatus;
      if (notes !== undefined) hkTask.notes = notes;
      localStorage.setItem(`${STORAGE_PREFIX}housekeepingTasks`, JSON.stringify(this.housekeepingTasks));
    }

    localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
  }

  // --- Master Data: Users Operations ---
  public saveUser(userData: Partial<User>, currentUser?: User): User {
    if (userData.id) {
      this.users = this.users.map(u => u.id === userData.id ? { ...u, ...userData } as User : u);
      localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(this.users));
      if (currentUser) this.logAudit(currentUser.name, currentUser.role, 'UPDATE_USER', 'Manajemen Pengguna', `Mengubah akun pengguna ${userData.name || userData.username}`, userData.id);
      return this.users.find(u => u.id === userData.id)!;
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        username: userData.username || `user${Date.now() % 1000}`,
        name: userData.name || 'Pengguna Baru',
        email: userData.email || 'user@kemenag.go.id',
        role: userData.role || 'PETUGAS',
        status: userData.status || 'ACTIVE',
        department: userData.department || 'Operasional Asrama Haji Papua',
        phone: userData.phone || '0812-0000-0000',
        created_at: new Date().toISOString(),
      };
      this.users.push(newUser);
      localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(this.users));
      if (currentUser) this.logAudit(currentUser.name, currentUser.role, 'CREATE_USER', 'Manajemen Pengguna', `Menambahkan pengguna baru ${newUser.name} (${newUser.username})`, newUser.id);
      return newUser;
    }
  }

  public deleteUser(id: string, currentUser?: User): { success: boolean; message: string } {
    if (currentUser?.role === 'HOUSEKEEPING') {
      return { success: false, message: 'Akses ditolak: Petugas Housekeeping tidak memiliki izin menghapus pengguna.' };
    }
    const userToDelete = this.users.find(u => u.id === id);
    if (!userToDelete) return { success: false, message: 'Pengguna tidak ditemukan' };

    if (userToDelete.role === 'SUPER_ADMIN') {
      return { success: false, message: 'Akun Super Admin sistem tidak dapat dihapus demi keamanan.' };
    }

    this.users = this.users.filter(u => u.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(this.users));
    if (currentUser) this.logAudit(currentUser.name, currentUser.role, 'DELETE_USER', 'Manajemen Pengguna', `Menghapus akun ${userToDelete.name} (${userToDelete.username})`, id);
    return { success: true, message: `Pengguna ${userToDelete.name} berhasil dihapus.` };
  }

  // --- Master Data: Buildings Operations ---
  public saveBuilding(buildingData: Partial<Building>, user?: User): Building {
    if (buildingData.id) {
      this.buildings = this.buildings.map(b => b.id === buildingData.id ? { ...b, ...buildingData } as Building : b);
      localStorage.setItem(`${STORAGE_PREFIX}buildings`, JSON.stringify(this.buildings));
      if (user) this.logAudit(user.name, user.role, 'UPDATE_BUILDING', 'Master Gedung', `Mengubah data gedung ${buildingData.name || buildingData.id}`, buildingData.id);
      return this.buildings.find(b => b.id === buildingData.id)!;
    } else {
      const newBuilding: Building = {
        id: `bld-${Date.now()}`,
        code: (buildingData.code || 'BLD').toUpperCase(),
        name: buildingData.name || 'Gedung Baru',
        total_floors: Number(buildingData.total_floors) || 3,
        description: buildingData.description || '',
        status: buildingData.status || 'ACTIVE',
        created_at: new Date().toISOString(),
      };
      this.buildings.push(newBuilding);
      localStorage.setItem(`${STORAGE_PREFIX}buildings`, JSON.stringify(this.buildings));
      if (user) this.logAudit(user.name, user.role, 'CREATE_BUILDING', 'Master Gedung', `Menambahkan gedung baru ${newBuilding.name} (${newBuilding.code})`, newBuilding.id);
      return newBuilding;
    }
  }

  public deleteBuilding(id: string, user?: User): { success: boolean; message: string } {
    if (user?.role === 'HOUSEKEEPING') {
      return { success: false, message: 'Akses ditolak: Petugas Housekeeping tidak diizinkan menghapus data master gedung. Anda hanya berwenang memperbarui status/kondisi.' };
    }
    const bld = this.buildings.find(b => b.id === id);
    if (!bld) return { success: false, message: 'Gedung tidak ditemukan' };

    const roomsInBuilding = this.rooms.filter(r => r.building_id === id);
    if (roomsInBuilding.length > 0) {
      return { 
        success: false, 
        message: `Gedung ${bld.name} tidak dapat dihapus karena masih memiliki ${roomsInBuilding.length} kamar terdaftar. Harap pindahkan atau hapus kamar terkait terlebih dahulu.` 
      };
    }

    this.buildings = this.buildings.filter(b => b.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}buildings`, JSON.stringify(this.buildings));
    if (user) this.logAudit(user.name, user.role, 'DELETE_BUILDING', 'Master Gedung', `Menghapus gedung ${bld.name} (${bld.code})`, id);
    return { success: true, message: `Gedung ${bld.name} berhasil dihapus.` };
  }

  // --- Master Data: Rooms Operations ---
  public saveRoom(roomData: Partial<Room>, user?: User): Room {
    if (roomData.id) {
      const oldRoom = this.rooms.find(r => r.id === roomData.id);
      const updatedCapacity = roomData.capacity !== undefined ? Number(roomData.capacity) : (oldRoom?.capacity || 4);
      const updatedRoomNumber = roomData.room_number || oldRoom?.room_number || 'A100';

      this.rooms = this.rooms.map(r => r.id === roomData.id ? { 
        ...r, 
        ...roomData, 
        capacity: updatedCapacity,
        total_beds: updatedCapacity,
        updated_at: new Date().toISOString() 
      } as Room : r);

      // Adjust beds if capacity or room number changed
      const currentBeds = this.beds.filter(b => b.room_id === roomData.id);
      if (currentBeds.length < updatedCapacity) {
        for (let b = currentBeds.length + 1; b <= updatedCapacity; b++) {
          const bedCode = `${updatedRoomNumber}-B0${b}`;
          this.beds.push({
            id: `bed-${roomData.id}-${Date.now()}-${b}`,
            bed_code: bedCode,
            room_id: roomData.id,
            status: 'AVAILABLE',
          });
        }
      } else if (currentBeds.length > updatedCapacity) {
        // Remove excess beds if they are AVAILABLE (not occupied)
        let bedsToRemove = currentBeds.length - updatedCapacity;
        this.beds = this.beds.filter(b => {
          if (b.room_id === roomData.id && b.status === 'AVAILABLE' && bedsToRemove > 0) {
            bedsToRemove--;
            return false;
          }
          return true;
        });
      }

      // Update bed codes if room_number changed
      if (oldRoom && oldRoom.room_number !== updatedRoomNumber) {
        this.beds = this.beds.map((b, idx) => {
          if (b.room_id === roomData.id) {
            const bedIdx = String(idx + 1).padStart(2, '0');
            return { ...b, bed_code: `${updatedRoomNumber}-B${bedIdx}` };
          }
          return b;
        });
      }

      // Sync with housekeepingTasks
      const hkTask = this.housekeepingTasks.find(t => t.room_id === roomData.id);
      if (hkTask) {
        if (roomData.housekeeping_status) {
          hkTask.status = roomData.housekeeping_status as HousekeepingStatus;
        }
        if (roomData.notes !== undefined) {
          hkTask.notes = roomData.notes;
        }
        if (user) {
          if (hkTask.status === 'IN_CLEANING') hkTask.assigned_to = user.name;
          if (hkTask.status === 'INSPECTED' || hkTask.status === 'READY') hkTask.inspected_by = user.name;
        }
        localStorage.setItem(`${STORAGE_PREFIX}housekeepingTasks`, JSON.stringify(this.housekeepingTasks));
      } else if (roomData.housekeeping_status && roomData.housekeeping_status !== 'READY') {
        const newTask: HousekeepingTask = {
          id: `hk-${Date.now()}`,
          room_id: roomData.id!,
          task_type: 'REGULAR_CLEAN',
          status: roomData.housekeeping_status as HousekeepingStatus,
          priority: 'MEDIUM',
          assigned_to: user?.name || 'Housekeeping',
          notes: roomData.notes || '',
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        this.housekeepingTasks.unshift(newTask);
        localStorage.setItem(`${STORAGE_PREFIX}housekeepingTasks`, JSON.stringify(this.housekeepingTasks));
      }

      localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
      localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
      if (user) this.logAudit(user.name, user.role, 'UPDATE_ROOM', 'Master Kamar', `Mengubah data kamar ${updatedRoomNumber}`, roomData.id);
      return this.rooms.find(r => r.id === roomData.id)!;
    } else {
      const newId = `room-${(this.rooms.length + 1).toString().padStart(3, '0')}`;
      const newCapacity = Number(roomData.capacity) || 4;
      const newRoom: Room = {
        id: newId,
        room_number: roomData.room_number || 'A100',
        building_id: roomData.building_id || this.buildings[0]?.id || 'bld-01',
        floor_id: roomData.floor_id || this.floors[0]?.id || 'flr-01',
        room_type_id: roomData.room_type_id || this.roomTypes[0]?.id || 'rt-std',
        capacity: newCapacity,
        total_beds: newCapacity,
        occupied_beds: 0,
        rate_per_night: Number(roomData.rate_per_night) || 350000,
        status: (roomData.status as RoomStatus) || 'AVAILABLE',
        housekeeping_status: (roomData.housekeeping_status as HousekeepingStatus) || 'READY',
        amenities: roomData.amenities || ['AC', 'Kamar Mandi Dalam', 'Sajadah & Arah Kiblat'],
        notes: roomData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.rooms.push(newRoom);

      // Create beds for this new room
      for (let b = 1; b <= newRoom.total_beds; b++) {
        const bedCode = `${newRoom.room_number}-B0${b}`;
        this.beds.push({
          id: `bed-${newId}-${b}`,
          bed_code: bedCode,
          room_id: newId,
          status: 'AVAILABLE',
        });
      }

      localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
      localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
      if (user) this.logAudit(user.name, user.role, 'CREATE_ROOM', 'Master Kamar', `Menambahkan kamar ${newRoom.room_number} (${newRoom.capacity} Bed)`, newRoom.id);
      return newRoom;
    }
  }

  public deleteRoom(id: string, user?: User): { success: boolean; message: string } {
    if (user?.role === 'HOUSEKEEPING') {
      return { success: false, message: 'Akses ditolak: Petugas Housekeeping tidak diizinkan menghapus master kamar. Anda hanya berwenang memperbarui status/kondisi kebersihan.' };
    }
    const room = this.rooms.find(r => r.id === id);
    if (!room) return { success: false, message: 'Kamar tidak ditemukan' };

    if (room.status === 'OCCUPIED' || room.status === 'RESERVED') {
      return { 
        success: false, 
        message: `Kamar ${room.room_number} tidak dapat dihapus karena berstatus ${room.status} (sedang terisi atau dipesan tamu).` 
      };
    }

    const occupiedBed = this.beds.find(b => b.room_id === id && (b.status === 'OCCUPIED' || b.status === 'RESERVED'));
    if (occupiedBed) {
      return { 
        success: false, 
        message: `Kamar ${room.room_number} memiliki tempat tidur ${occupiedBed.bed_code} yang masih aktif digunakan.` 
      };
    }

    this.rooms = this.rooms.filter(r => r.id !== id);
    this.beds = this.beds.filter(b => b.room_id !== id);

    localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
    if (user) this.logAudit(user.name, user.role, 'DELETE_ROOM', 'Master Kamar', `Menghapus kamar ${room.room_number} beserta tempat tidurnya`, id);
    return { success: true, message: `Kamar ${room.room_number} beserta tempat tidurnya berhasil dihapus.` };
  }

  // --- Master Data: Bed Operations ---
  public saveBed(bedData: Partial<Bed>, user?: User): Bed {
    if (bedData.id) {
      this.beds = this.beds.map(b => b.id === bedData.id ? { ...b, ...bedData } as Bed : b);
      localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
      if (user) this.logAudit(user.name, user.role, 'UPDATE_BED', 'Master Bed', `Mengubah data tempat tidur ${bedData.bed_code || bedData.id}`, bedData.id);
      return this.beds.find(b => b.id === bedData.id)!;
    } else {
      const newBed: Bed = {
        id: `bed-${Date.now()}`,
        bed_code: bedData.bed_code || 'BED-NEW',
        room_id: bedData.room_id || this.rooms[0]?.id || 'room-001',
        status: bedData.status || 'AVAILABLE',
        notes: bedData.notes,
      };
      this.beds.push(newBed);
      
      // Update room total_beds
      const room = this.rooms.find(r => r.id === newBed.room_id);
      if (room) {
        room.total_beds = this.beds.filter(b => b.room_id === room.id).length;
        room.capacity = room.total_beds;
        localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
      }

      localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
      if (user) this.logAudit(user.name, user.role, 'CREATE_BED', 'Master Bed', `Menambahkan tempat tidur ${newBed.bed_code}`, newBed.id);
      return newBed;
    }
  }

  public deleteBed(id: string, user?: User): { success: boolean; message: string } {
    if (user?.role === 'HOUSEKEEPING') {
      return { success: false, message: 'Akses ditolak: Petugas Housekeeping tidak diizinkan menghapus data tempat tidur. Anda hanya berwenang memperbarui status/kondisi.' };
    }
    const bed = this.beds.find(b => b.id === id);
    if (!bed) return { success: false, message: 'Tempat tidur tidak ditemukan' };

    if (bed.status === 'OCCUPIED' || bed.status === 'RESERVED') {
      return { success: false, message: `Tempat tidur ${bed.bed_code} sedang berstatus ${bed.status} dan tidak dapat dihapus.` };
    }

    const roomId = bed.room_id;
    this.beds = this.beds.filter(b => b.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));

    // Update room total_beds
    const room = this.rooms.find(r => r.id === roomId);
    if (room) {
      room.total_beds = this.beds.filter(b => b.room_id === room.id).length;
      room.capacity = room.total_beds;
      localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
    }

    if (user) this.logAudit(user.name, user.role, 'DELETE_BED', 'Master Bed', `Menghapus tempat tidur ${bed.bed_code}`, id);
    return { success: true, message: `Tempat tidur ${bed.bed_code} berhasil dihapus.` };
  }

  // --- Master Data: Room Types Operations ---
  public saveRoomType(typeData: Partial<RoomType>, user?: User): RoomType {
    const baseRate = Number(typeData.base_rate_per_night ?? typeData.base_rate) || 250000;
    const cap = Number(typeData.default_capacity ?? typeData.capacity) || 2;

    if (typeData.id) {
      this.roomTypes = this.roomTypes.map(t => t.id === typeData.id ? { 
        ...t, 
        ...typeData,
        base_rate_per_night: baseRate,
        base_rate: baseRate,
        default_capacity: cap,
        capacity: cap
      } as RoomType : t);
      localStorage.setItem(`${STORAGE_PREFIX}roomTypes`, JSON.stringify(this.roomTypes));
      if (user) this.logAudit(user.name, user.role, 'UPDATE_ROOM_TYPE', 'Master Tipe Kamar', `Mengubah tipe kamar ${typeData.name || typeData.id}`, typeData.id);
      return this.roomTypes.find(t => t.id === typeData.id)!;
    } else {
      const newType: RoomType = {
        id: `rt-${Date.now()}`,
        code: (typeData.code || 'TYPE').toUpperCase(),
        name: typeData.name || 'Tipe Kamar Baru',
        category: 'PENGINAPAN',
        rate_unit: 'PER_NIGHT',
        description: typeData.description || '',
        default_capacity: cap,
        capacity: cap,
        base_rate_per_night: baseRate,
        base_rate: baseRate,
        amenities: typeData.amenities || ['Double Bed', 'AC', 'Meja', 'Lemari', 'Closet Duduk'],
        image_url: typeData.image_url,
      };
      this.roomTypes.push(newType);
      localStorage.setItem(`${STORAGE_PREFIX}roomTypes`, JSON.stringify(this.roomTypes));
      if (user) this.logAudit(user.name, user.role, 'CREATE_ROOM_TYPE', 'Master Tipe Kamar', `Menambahkan tipe kamar baru ${newType.name}`, newType.id);
      return newType;
    }
  }

  public deleteRoomType(id: string, user?: User): { success: boolean; message: string } {
    if (user?.role === 'HOUSEKEEPING') {
      return { success: false, message: 'Akses ditolak: Petugas Housekeeping tidak diizinkan menghapus tipe kamar.' };
    }
    const rType = this.roomTypes.find(t => t.id === id);
    if (!rType) return { success: false, message: 'Tipe kamar tidak ditemukan' };

    const roomsUsingType = this.rooms.filter(r => r.room_type_id === id);
    if (roomsUsingType.length > 0) {
      return { 
        success: false, 
        message: `Tipe kamar ${rType.name} masih digunakan oleh ${roomsUsingType.length} kamar aktif. Ubah tipe kamar terkait sebelum menghapus.` 
      };
    }

    this.roomTypes = this.roomTypes.filter(t => t.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}roomTypes`, JSON.stringify(this.roomTypes));
    if (user) this.logAudit(user.name, user.role, 'DELETE_ROOM_TYPE', 'Master Tipe Kamar', `Menghapus tipe kamar ${rType.name}`, id);
    return { success: true, message: `Tipe kamar ${rType.name} berhasil dihapus.` };
  }

  // --- Master Data: Facilities Operations ---
  public saveFacility(facData: Partial<Facility>, user?: User): Facility {
    if (facData.id) {
      this.facilities = this.facilities.map(f => f.id === facData.id ? { ...f, ...facData } as Facility : f);
      localStorage.setItem(`${STORAGE_PREFIX}facilities`, JSON.stringify(this.facilities));
      if (user) this.logAudit(user.name, user.role, 'UPDATE_FACILITY', 'Master Fasilitas', `Mengubah data fasilitas/aula ${facData.name || facData.id}`, facData.id);
      return this.facilities.find(f => f.id === facData.id)!;
    } else {
      const newFac: Facility = {
        id: `fac-${Date.now()}`,
        name: facData.name || 'Fasilitas Baru',
        type: facData.type || 'AULA',
        location: facData.location || 'Kompleks Asrama Haji Papua',
        capacity: Number(facData.capacity) || 50,
        daily_rate: Number(facData.daily_rate) || 0,
        hourly_rate: facData.hourly_rate ? Number(facData.hourly_rate) : undefined,
        status: facData.status || 'AVAILABLE',
        description: facData.description || '',
        amenities: facData.amenities || ['AC / Kipas Angin', 'Sound System', 'Kursi & Meja'],
      };
      this.facilities.push(newFac);
      localStorage.setItem(`${STORAGE_PREFIX}facilities`, JSON.stringify(this.facilities));
      if (user) this.logAudit(user.name, user.role, 'CREATE_FACILITY', 'Master Fasilitas', `Menambahkan fasilitas baru ${newFac.name}`, newFac.id);
      return newFac;
    }
  }

  public deleteFacility(id: string, user?: User): { success: boolean; message: string } {
    if (user?.role === 'HOUSEKEEPING') {
      return { success: false, message: 'Akses ditolak: Petugas Housekeeping tidak diizinkan menghapus fasilitas. Anda hanya berwenang memperbarui status/kondisi.' };
    }
    const fac = this.facilities.find(f => f.id === id);
    if (!fac) return { success: false, message: 'Fasilitas tidak ditemukan' };

    this.facilities = this.facilities.filter(f => f.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}facilities`, JSON.stringify(this.facilities));
    if (user) this.logAudit(user.name, user.role, 'DELETE_FACILITY', 'Master Fasilitas', `Menghapus fasilitas ${fac.name}`, id);
    return { success: true, message: `Fasilitas ${fac.name} berhasil dihapus.` };
  }

  // --- Master Data: Institutions Operations ---
  public saveInstitution(instData: Partial<Institution>, user?: User): Institution {
    if (instData.id) {
      this.institutions = this.institutions.map(i => i.id === instData.id ? { ...i, ...instData } as Institution : i);
      localStorage.setItem(`${STORAGE_PREFIX}institutions`, JSON.stringify(this.institutions));
      if (user) this.logAudit(user.name, user.role, 'UPDATE_INSTITUTION', 'Master Instansi', `Mengubah instansi ${instData.name || instData.id}`, instData.id);
      return this.institutions.find(i => i.id === instData.id)!;
    } else {
      const newInst: Institution = {
        id: `inst-${Date.now()}`,
        name: instData.name || 'Instansi Baru',
        type: instData.type || 'KEMENAG',
        address: instData.address || 'Jayapura, Papua',
        phone: instData.phone || '0812-0000-0000',
        contact_person: instData.contact_person || 'PIC Instansi',
        email: instData.email,
      };
      this.institutions.push(newInst);
      localStorage.setItem(`${STORAGE_PREFIX}institutions`, JSON.stringify(this.institutions));
      if (user) this.logAudit(user.name, user.role, 'CREATE_INSTITUTION', 'Master Instansi', `Menambahkan instansi ${newInst.name}`, newInst.id);
      return newInst;
    }
  }

  public deleteInstitution(id: string, user?: User): { success: boolean; message: string } {
    if (user?.role === 'HOUSEKEEPING') {
      return { success: false, message: 'Akses ditolak: Petugas Housekeeping tidak diizinkan menghapus data instansi.' };
    }
    const inst = this.institutions.find(i => i.id === id);
    if (!inst) return { success: false, message: 'Instansi tidak ditemukan' };

    this.institutions = this.institutions.filter(i => i.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}institutions`, JSON.stringify(this.institutions));
    if (user) this.logAudit(user.name, user.role, 'DELETE_INSTITUTION', 'Master Instansi', `Menghapus instansi ${inst.name}`, id);
    return { success: true, message: `Instansi ${inst.name} berhasil dihapus.` };
  }

  // --- Master Data: Rates Operations ---
  public saveRate(rateData: Partial<RateItem>, user?: User): RateItem {
    if (rateData.id) {
      this.rates = this.rates.map(r => r.id === rateData.id ? { ...r, ...rateData } as RateItem : r);
      localStorage.setItem(`${STORAGE_PREFIX}rates`, JSON.stringify(this.rates));
      if (user) this.logAudit(user.name, user.role, 'UPDATE_RATE', 'Master Tarif', `Mengubah tarif ${rateData.name || rateData.id}`, rateData.id);
      return this.rates.find(r => r.id === rateData.id)!;
    } else {
      const newRate: RateItem = {
        id: `rate-${Date.now()}`,
        name: rateData.name || 'Tarif Baru',
        category: rateData.category || 'KAMAR',
        user_type: rateData.user_type || 'Umum / Instansi',
        unit: rateData.unit || 'PER_ROOM',
        rate: Number(rateData.rate) || 350000,
        description: rateData.description || '',
        is_active: rateData.is_active !== undefined ? rateData.is_active : true,
        effective_date: rateData.effective_date || new Date().toISOString().split('T')[0],
      };
      this.rates.unshift(newRate);
      localStorage.setItem(`${STORAGE_PREFIX}rates`, JSON.stringify(this.rates));
      if (user) this.logAudit(user.name, user.role, 'CREATE_RATE', 'Master Tarif', `Menambahkan tarif baru ${newRate.name} (Rp ${newRate.rate.toLocaleString('id-ID')})`, newRate.id);
      return newRate;
    }
  }

  public updateRateWithHistory(
    rateId: string, 
    newRate: number, 
    effectiveDate: string, 
    reason: string, 
    user: User
  ): { success: boolean; message: string; rate?: RateItem; history?: RateHistory } {
    const rate = this.rates.find(r => r.id === rateId);
    if (!rate) return { success: false, message: 'Data tarif tidak ditemukan.' };

    const previousRate = rate.rate;
    rate.previous_rate = previousRate;
    rate.rate = Number(newRate);
    rate.effective_date = effectiveDate || new Date().toISOString().split('T')[0];

    // If rate has target_id (RoomType or Facility), sync the master object base rate
    if (rate.target_id) {
      const rt = this.roomTypes.find(t => t.id === rate.target_id);
      if (rt) {
        rt.base_rate_per_night = Number(newRate);
        localStorage.setItem(`${STORAGE_PREFIX}roomTypes`, JSON.stringify(this.roomTypes));
      }
      const fac = this.facilities.find(f => f.id === rate.target_id);
      if (fac) {
        fac.daily_rate = Number(newRate);
        localStorage.setItem(`${STORAGE_PREFIX}facilities`, JSON.stringify(this.facilities));
      }
    }

    const historyRecord: RateHistory = {
      id: `rh-${Date.now()}`,
      rate_id: rate.id,
      rate_name: rate.name,
      previous_rate: previousRate,
      new_rate: Number(newRate),
      effective_date: rate.effective_date,
      changed_by: user.name,
      changed_at: new Date().toISOString(),
      reason: reason || 'Penyesuaian tarif resmi oleh Administrator',
    };

    this.rateHistories.unshift(historyRecord);

    localStorage.setItem(`${STORAGE_PREFIX}rates`, JSON.stringify(this.rates));
    localStorage.setItem(`${STORAGE_PREFIX}rateHistories`, JSON.stringify(this.rateHistories));

    this.logAudit(
      user.name, 
      user.role, 
      'UPDATE_RATE_WITH_HISTORY', 
      'Master Tarif', 
      `Mengubah tarif ${rate.name} dari Rp ${previousRate.toLocaleString('id-ID')} menjadi Rp ${Number(newRate).toLocaleString('id-ID')} (Berlaku mulai: ${rate.effective_date})`, 
      rate.id
    );

    this.addNotification(
      'Perubahan Tarif Resmi Disimpan',
      `Tarif ${rate.name} diperbarui menjadi Rp ${Number(newRate).toLocaleString('id-ID')} oleh ${user.name}. Transaksi lama tetap menggunakan tarif saat reservasi dibuat.`,
      'SYSTEM',
      'rates',
      rate.id
    );

    return { 
      success: true, 
      message: `Tarif ${rate.name} berhasil diperbarui menjadi Rp ${Number(newRate).toLocaleString('id-ID')} berlaku mulai ${rate.effective_date}.`, 
      rate, 
      history: historyRecord 
    };
  }

  public deleteRate(id: string, user?: User): { success: boolean; message: string } {
    if (user?.role === 'HOUSEKEEPING') {
      return { success: false, message: 'Akses ditolak: Petugas Housekeeping tidak diizinkan menghapus data tarif.' };
    }
    const rateItem = this.rates.find(r => r.id === id);
    if (!rateItem) return { success: false, message: 'Item tarif tidak ditemukan' };

    this.rates = this.rates.filter(r => r.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}rates`, JSON.stringify(this.rates));
    if (user) this.logAudit(user.name, user.role, 'DELETE_RATE', 'Master Tarif', `Menghapus tarif ${rateItem.name}`, id);
    return { success: true, message: `Tarif ${rateItem.name} berhasil dihapus.` };
  }

  public deleteGuest(id: string, user?: User): { success: boolean; message: string } {
    if (user?.role === 'HOUSEKEEPING') {
      return { success: false, message: 'Akses ditolak: Petugas Housekeeping tidak diizinkan menghapus data tamu.' };
    }
    const guest = this.guests.find(g => g.id === id);
    if (!guest) return { success: false, message: 'Tamu tidak ditemukan' };

    this.guests = this.guests.filter(g => g.id !== id);
    localStorage.setItem(`${STORAGE_PREFIX}guests`, JSON.stringify(this.guests));
    if (user) this.logAudit(user.name, user.role, 'DELETE_GUEST', 'Buku Tamu', `Menghapus tamu ${guest.full_name}`, id);
    return { success: true, message: `Data tamu ${guest.full_name} berhasil dihapus.` };
  }

  // --- Guests Operations ---
  public saveGuest(guestData: Partial<Guest>): Guest {
    if (guestData.id) {
      this.guests = this.guests.map(g => g.id === guestData.id ? { ...g, ...guestData } as Guest : g);
      localStorage.setItem(`${STORAGE_PREFIX}guests`, JSON.stringify(this.guests));
      return this.guests.find(g => g.id === guestData.id)!;
    } else {
      const newId = `gst-${Date.now()}`;
      const newGuest: Guest = {
        id: newId,
        nik: guestData.nik || '917101' + Math.floor(Math.random() * 10000000000),
        full_name: guestData.full_name || 'Tamu Baru',
        gender: guestData.gender || 'L',
        phone: guestData.phone || '0812-0000-0000',
        email: guestData.email,
        institution_id: guestData.institution_id,
        guest_type: guestData.guest_type || 'UMUM',
        regency_city: guestData.regency_city || 'Kota Jayapura',
        province: guestData.province || 'Papua',
        address: guestData.address || 'Jayapura, Papua',
        notes: guestData.notes,
        stay_count: 1,
        created_at: new Date().toISOString(),
      };
      this.guests.unshift(newGuest);
      localStorage.setItem(`${STORAGE_PREFIX}guests`, JSON.stringify(this.guests));
      return newGuest;
    }
  }

  // --- Groups Operations ---
  public saveGroup(groupData: Partial<Group>): Group {
    if (groupData.id) {
      this.groups = this.groups.map(g => g.id === groupData.id ? { ...g, ...groupData } as Group : g);
      localStorage.setItem(`${STORAGE_PREFIX}groups`, JSON.stringify(this.groups));
      return this.groups.find(g => g.id === groupData.id)!;
    } else {
      const newId = `grp-${Date.now()}`;
      const newGroup: Group = {
        id: newId,
        group_name: groupData.group_name || 'Rombongan Baru',
        activity_name: groupData.activity_name || 'Kegiatan Keagamaan / Dinas',
        institution_id: groupData.institution_id,
        pic_name: groupData.pic_name || 'Koordinator Rombongan',
        pic_phone: groupData.pic_phone || '0812-0000-0000',
        pic_email: groupData.pic_email,
        total_members: groupData.total_members || 10,
        male_count: groupData.male_count || 5,
        female_count: groupData.female_count || 5,
        checkin_date: groupData.checkin_date || '2026-09-26',
        checkout_date: groupData.checkout_date || '2026-09-29',
        notes: groupData.notes,
        created_at: new Date().toISOString(),
      };
      this.groups.unshift(newGroup);
      localStorage.setItem(`${STORAGE_PREFIX}groups`, JSON.stringify(this.groups));
      return newGroup;
    }
  }

  // --- Reservations & Munakosah Operations ---
  public generateReservationNo(): string {
    const count = this.reservations.length + 1;
    const year = 2026;
    return `RSV/AHP/${year}/${count.toString().padStart(5, '0')}`;
  }

  public generateSpmaNo(): string {
    const count = this.reservations.length + 1;
    const year = 2026;
    return `SPMA/AHP/${year}/${count.toString().padStart(5, '0')}`;
  }

  public generateSimponiBillingCode(): string {
    // 15-digit Kode Billing Simponi MPN-G3 Kemenkeu
    const seq = Math.floor(100000 + Math.random() * 900000).toString();
    return `820260926${seq}`;
  }

  public generateSpkNo(): string {
    const count = (this.invoices.filter(i => i.spk_contract_no).length + 1).toString().padStart(3, '0');
    return `SPK/AHP/KS/2026/${count}`;
  }

  // --- Availability & Conflict Prevention (Atomic Check) ---
  public checkRoomAvailability(
    roomTypeId: string, 
    checkinDate: string, 
    checkoutDate: string, 
    requestedRooms: number, 
    excludeReservationId?: string
  ): { available: boolean; totalRooms: number; bookedRooms: number; availableRooms: number; message: string } {
    const normalizeRoomTypeId = (id?: string) => (id === 'rt-sup' ? 'rt-spr' : id);
    const targetTypeId = normalizeRoomTypeId(roomTypeId);
    const totalRooms = this.rooms.filter(r => normalizeRoomTypeId(r.room_type_id) === targetTypeId && r.status !== 'INACTIVE').length;
    
    // Check overlap with active reservations for this room type
    const overlapping = this.reservations.filter(r => {
      if (excludeReservationId && r.id === excludeReservationId) return false;
      if (r.status === 'CANCELLED' || r.status === 'REJECTED' || r.status === 'CHECKED_OUT') return false;
      if (r.rental_category === 'RUANG_PERTEMUAN') return false;
      if (r.room_type_id && normalizeRoomTypeId(r.room_type_id) !== targetTypeId) return false;

      // Overlap condition: not (end <= start2 or start >= end2)
      const rCheckin = r.checkin_date;
      const rCheckout = r.checkout_date;
      return !(checkoutDate <= rCheckin || checkinDate >= rCheckout);
    });

    const bookedRooms = overlapping.reduce((sum, r) => sum + (r.unit_count || r.total_rooms_requested || 1), 0);
    const availableRooms = Math.max(0, totalRooms - bookedRooms);
    const available = availableRooms >= requestedRooms;

    return {
      available,
      totalRooms,
      bookedRooms,
      availableRooms,
      message: available 
        ? `Tersedia ${availableRooms} dari total ${totalRooms} kamar pada rentang tanggal tersebut.`
        : `Kapasitas kamar tidak mencukupi (Double Booking Dicegah). Tersedia ${availableRooms} kamar, diminta ${requestedRooms} kamar untuk periode ${checkinDate} s.d. ${checkoutDate}.`
    };
  }

  public checkFacilityAvailability(
    facilityId: string, 
    checkinDate: string, 
    checkoutDate: string, 
    excludeReservationId?: string
  ): { available: boolean; conflictingReservation?: Reservation; message: string } {
    const normalizeFacilityId = (id?: string) => {
      if (!id) return 'fac-01';
      if (id === 'fac-1') return 'fac-01';
      if (id === 'fac-class') return 'fac-07';
      return id;
    };
    const fId = normalizeFacilityId(facilityId);
    const facility = this.facilities.find(f => normalizeFacilityId(f.id) === fId);
    if (!facility) return { available: false, message: 'Ruang pertemuan / fasilitas tidak ditemukan.' };

    if (facility.status === 'MAINTENANCE' || facility.status === 'INACTIVE') {
      return { available: false, message: `Fasilitas ${facility.name} saat ini sedang dalam status ${facility.status}.` };
    }

    const conflict = this.reservations.find(r => {
      if (excludeReservationId && r.id === excludeReservationId) return false;
      if (r.status === 'CANCELLED' || r.status === 'REJECTED' || r.status === 'CHECKED_OUT') return false;
      if (normalizeFacilityId(r.facility_id) !== fId) return false;

      const rCheckin = r.checkin_date;
      const rCheckout = r.checkout_date;
      return !(checkoutDate <= rCheckin || checkinDate >= rCheckout);
    });

    if (conflict) {
      return {
        available: false,
        conflictingReservation: conflict,
        message: `Benturan Jadwal: ${facility.name} sudah dipesan pada tanggal tersebut untuk kegiatan "${conflict.activity_name || conflict.reservation_no}" (${conflict.checkin_date} s.d. ${conflict.checkout_date}).`
      };
    }

    return {
      available: true,
      message: `${facility.name} tersedia pada periode ${checkinDate} s.d. ${checkoutDate}.`
    };
  }

  public createReservation(data: Partial<Reservation>, user?: User): { success: boolean; message: string; reservation?: Reservation } {
    const reservationNo = this.generateReservationNo();
    const spmaNo = data.spma_no || this.generateSpmaNo();
    const checkinDate = data.checkin_date || new Date().toISOString().split('T')[0];
    const checkoutDate = data.checkout_date || checkinDate;
    const simponiBillingCode = data.simponi_billing_code || this.generateSimponiBillingCode();

    // Determine category
    const rentalCategory = data.rental_category || (data.facility_id ? 'RUANG_PERTEMUAN' : 'PENGINAPAN');
    const unitCount = Number(data.unit_count || data.total_rooms_requested || 1);
    let snapshotRate = Number(data.snapshot_rate || 0);
    let duration = Number(data.duration || 1);
    let durationUnit: 'MALAM' | 'HARI' = rentalCategory === 'PENGINAPAN' ? 'MALAM' : 'HARI';
    let calculatedTotal = 0;
    let roomTypeName: string | undefined = data.room_type_name;
    let facilityName: string | undefined = data.facility_name;

    // Calculate dates duration
    const cinTime = new Date(checkinDate).getTime();
    const coutTime = new Date(checkoutDate).getTime();
    const daysDiff = Math.max(1, Math.round((coutTime - cinTime) / (1000 * 60 * 60 * 24)));

    if (rentalCategory === 'PENGINAPAN') {
      durationUnit = 'MALAM';
      duration = daysDiff;
      const normalizeRoomTypeId = (id?: string) => (id === 'rt-sup' ? 'rt-spr' : id);
      const roomTypeId = normalizeRoomTypeId(data.room_type_id || 'rt-std')!;
      const rType = this.roomTypes.find(rt => normalizeRoomTypeId(rt.id) === roomTypeId);
      if (rType) {
        roomTypeName = rType.name;
        if (!snapshotRate) snapshotRate = rType.base_rate_per_night || rType.base_rate || 250000;
      } else {
        if (!snapshotRate) snapshotRate = 250000;
      }

      // Check room availability (prevent double booking)
      const avail = this.checkRoomAvailability(roomTypeId, checkinDate, checkoutDate, unitCount);
      if (!avail.available) {
        return { success: false, message: avail.message };
      }

      // Rumus Penginapan: Total Biaya = Jumlah Malam × Tarif Kamar × Jumlah Kamar
      calculatedTotal = duration * snapshotRate * unitCount;
    } else {
      // RUANG_PERTEMUAN
      durationUnit = 'HARI';
      // For meeting room, if same day checkin & checkout, it counts as 1 day
      duration = checkinDate === checkoutDate ? 1 : daysDiff;
      const normalizeFacilityId = (id?: string) => {
        if (!id) return 'fac-01';
        if (id === 'fac-1') return 'fac-01';
        if (id === 'fac-class') return 'fac-07';
        return id;
      };
      const facilityId = normalizeFacilityId(data.facility_id);
      const facility = this.facilities.find(f => normalizeFacilityId(f.id) === facilityId);
      if (!facility) {
        return { success: false, message: 'Fasilitas atau ruang pertemuan tidak ditemukan.' };
      }
      facilityName = facility.name;
      if (!snapshotRate) snapshotRate = facility.daily_rate;

      // Validate capacity
      const totalGuests = Number(data.total_guests || 1);
      if (facility.capacity && totalGuests > facility.capacity) {
        return {
          success: false,
          message: `Kapasitas Terlampaui: Jumlah peserta (${totalGuests} orang) melebihi kapasitas maksimal ${facility.name} (${facility.capacity} orang).`
        };
      }

      // Check facility schedule conflict
      const conflictCheck = this.checkFacilityAvailability(facilityId, checkinDate, checkoutDate);
      if (!conflictCheck.available) {
        return { success: false, message: conflictCheck.message };
      }

      // Rumus Ruang Pertemuan: Total Biaya = Jumlah Hari × Tarif Ruangan × Jumlah Unit
      calculatedTotal = duration * snapshotRate * unitCount;
    }

    const finalTotal = data.total_amount !== undefined && data.total_amount > 0 ? Number(data.total_amount) : calculatedTotal;
    const creatorName = user?.name || (data.guest_name ? `Pemesan Online (${data.guest_name})` : 'Portal Reservasi Online (Mandiri)');
    const creatorRole = user?.role || 'UMUM';

    const newReservation: Reservation = {
      id: `rsv-${Date.now()}`,
      reservation_no: reservationNo,
      reservation_date: new Date().toISOString(),
      reservation_type: data.reservation_type || 'INDIVIDUAL',
      rental_category: rentalCategory,
      room_type_id: data.room_type_id,
      room_type_name: roomTypeName,
      facility_id: data.facility_id,
      facility_name: facilityName,
      unit_count: unitCount,
      duration: duration,
      duration_unit: durationUnit,
      snapshot_rate: snapshotRate,
      guest_id: data.guest_id,
      guest_name: data.guest_name,
      group_id: data.group_id,
      institution_id: data.institution_id,
      activity_type: data.activity_type || 'UMUM',
      activity_name: data.activity_name || (rentalCategory === 'PENGINAPAN' ? `Penginapan Kamar ${roomTypeName || ''}` : `Sewa Ruangan ${facilityName || ''}`),
      checkin_date: checkinDate,
      checkout_date: checkoutDate,
      total_guests: data.total_guests || 1,
      male_count: data.male_count || (data.total_guests || 1),
      female_count: data.female_count || 0,
      total_rooms_requested: rentalCategory === 'PENGINAPAN' ? unitCount : 0,
      facility_requirements: data.facility_requirements,
      status: 'PENDING',
      payment_status: 'UNPAID',
      total_amount: finalTotal,
      paid_amount: 0,
      remaining_amount: finalTotal,
      notes: data.notes,
      spma_no: spmaNo,
      simponi_billing_code: simponiBillingCode,
      package_type: data.package_type || 'REGULER',
      created_by: creatorName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.reservations.unshift(newReservation);
    localStorage.setItem(`${STORAGE_PREFIX}reservations`, JSON.stringify(this.reservations));

    // Create corresponding Invoice for PNBP & Financial Audit
    const guestObj = data.guest_id ? this.guests.find(g => g.id === data.guest_id) : undefined;
    const billTo = data.guest_name || guestObj?.full_name || 'Tamu Online';
    const institutionObj = data.institution_id ? this.institutions.find(i => i.id === data.institution_id) : undefined;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_no: `INV/AHP/2026/${String(this.invoices.length + 1).padStart(5, '0')}`,
      reservation_id: newReservation.id,
      bill_to_name: billTo,
      institution_name: institutionObj?.name,
      issue_date: checkinDate,
      due_date: checkoutDate,
      subtotal: finalTotal,
      discount_amount: 0,
      tax_amount: 0,
      extra_charges: 0,
      total_amount: finalTotal,
      paid_amount: 0,
      balance_due: finalTotal,
      status: 'UNPAID',
      pnbp_account_code: rentalCategory === 'PENGINAPAN' ? '425111' : '425112',
      pnbp_account_name: rentalCategory === 'PENGINAPAN' ? 'Pendapatan Sewa Kamar Asrama Haji / Wisma' : 'Pendapatan Sewa Fasilitas & Ruangan Pertemuan',
      simponi_billing_code: simponiBillingCode,
      billing_expired_at: checkoutDate,
      notes: `Tagihan Reservasi ${reservationNo} (${rentalCategory}: ${roomTypeName || facilityName || ''})`,
      created_at: new Date().toISOString(),
    };
    this.invoices.unshift(newInvoice);
    localStorage.setItem(`${STORAGE_PREFIX}invoices`, JSON.stringify(this.invoices));

    this.logAudit(
      creatorName, 
      creatorRole, 
      'CREATE_RESERVATION', 
      'Reservasi', 
      `Membuat reservasi baru no ${reservationNo} (${rentalCategory}: ${duration} ${durationUnit} @ Rp ${snapshotRate.toLocaleString('id-ID')} x ${unitCount} unit = Rp ${finalTotal.toLocaleString('id-ID')})`, 
      newReservation.id
    );

    this.addNotification(
      'Reservasi Baru Dibuat', 
      `Reservasi ${reservationNo} (${spmaNo}) telah didaftarkan senilai Rp ${finalTotal.toLocaleString('id-ID')} dengan Kode Billing SIMPONI ${simponiBillingCode} dan menunggu verifikasi.`, 
      'RESERVATION', 
      'reservations', 
      newReservation.id
    );

    return { 
      success: true, 
      message: `Reservasi ${reservationNo} berhasil dibuat (${duration} ${durationUnit} x Rp ${snapshotRate.toLocaleString('id-ID')} = Rp ${finalTotal.toLocaleString('id-ID')}).`, 
      reservation: newReservation 
    };
  }

  public verifyReservation(reservationId: string, user: User, approve: boolean, notes?: string): boolean {
    const rsv = this.reservations.find(r => r.id === reservationId);
    if (!rsv) return false;

    rsv.status = approve ? 'CONFIRMED' : 'REJECTED';
    rsv.verified_by = user.name;
    rsv.verified_at = new Date().toISOString();
    if (notes) rsv.notes = (rsv.notes ? rsv.notes + ' | ' : '') + `Verifikasi: ${notes}`;
    rsv.updated_at = new Date().toISOString();

    localStorage.setItem(`${STORAGE_PREFIX}reservations`, JSON.stringify(this.reservations));

    this.logAudit(
      user.name, 
      user.role, 
      approve ? 'VERIFY_RESERVATION' : 'REJECT_RESERVATION', 
      'Reservasi', 
      `${approve ? 'Menyetujui' : 'Menolak'} reservasi ${rsv.reservation_no}`, 
      rsv.id
    );

    this.addNotification(
      `Reservasi ${approve ? 'Disetujui' : 'Ditolak'}`, 
      `Reservasi ${rsv.reservation_no} telah ${approve ? 'disetujui' : 'ditolak'} oleh ${user.name}.`,
      'RESERVATION',
      'reservations',
      rsv.id
    );

    return true;
  }

  // --- Room Assignment Operations ---
  public assignRoomBed(reservationId: string, guestId: string, roomId: string, bedId: string, user: User): boolean {
    const existing = this.roomAssignments.find(a => a.bed_id === bedId && a.status !== 'CANCELLED' && a.status !== 'CHECKED_OUT');
    if (existing) {
      return false; // Bed already occupied/assigned
    }

    const newAssignment: RoomAssignment = {
      id: `ra-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      reservation_id: reservationId,
      guest_id: guestId,
      room_id: roomId,
      bed_id: bedId,
      assigned_at: new Date().toISOString(),
      assigned_by: user.name,
      status: 'ACTIVE',
    };

    this.roomAssignments.push(newAssignment);
    localStorage.setItem(`${STORAGE_PREFIX}roomAssignments`, JSON.stringify(this.roomAssignments));

    // Update bed status to RESERVED or OCCUPIED
    this.beds = this.beds.map(b => b.id === bedId ? { ...b, status: 'RESERVED', current_guest_id: guestId } : b);
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));

    this.logAudit(user.name, user.role, 'ASSIGN_BED', 'Penempatan Kamar', `Menempatkan tamu pada Bed ${bedId}`, reservationId);
    return true;
  }

  public removeAssignment(assignmentId: string, user: User): void {
    const assign = this.roomAssignments.find(a => a.id === assignmentId);
    if (!assign) return;

    assign.status = 'CANCELLED';
    this.beds = this.beds.map(b => b.id === assign.bed_id ? { ...b, status: 'AVAILABLE', current_guest_id: undefined } : b);

    localStorage.setItem(`${STORAGE_PREFIX}roomAssignments`, JSON.stringify(this.roomAssignments));
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
    this.logAudit(user.name, user.role, 'REMOVE_ASSIGNMENT', 'Penempatan Kamar', `Membatalkan penempatan kamar untuk bed ${assign.bed_id}`, assign.reservation_id);
  }

  // Auto assign beds for reservation
  public autoAssignReservation(reservationId: string, user: User, separateGender = true): { assignedCount: number; message: string } {
    const rsv = this.reservations.find(r => r.id === reservationId);
    if (!rsv) return { assignedCount: 0, message: 'Reservasi tidak ditemukan' };

    // Find available rooms and beds
    const availableBeds = this.beds.filter(b => b.status === 'AVAILABLE');
    if (availableBeds.length === 0) {
      return { assignedCount: 0, message: 'Tidak ada tempat tidur (bed) yang tersedia' };
    }

    let assigned = 0;
    const roomsToOccupied = new Set<string>();

    for (let i = 0; i < Math.min(rsv.total_guests, availableBeds.length); i++) {
      const bed = availableBeds[i];
      const guestId = rsv.guest_id || `gst-auto-${i + 1}`;
      
      const newAssignment: RoomAssignment = {
        id: `ra-${Date.now()}-${i}`,
        reservation_id: reservationId,
        guest_id: guestId,
        room_id: bed.room_id,
        bed_id: bed.id,
        assigned_at: new Date().toISOString(),
        assigned_by: user.name,
        status: 'ACTIVE',
      };
      this.roomAssignments.push(newAssignment);
      bed.status = 'RESERVED';
      bed.current_guest_id = guestId;
      roomsToOccupied.add(bed.room_id);
      assigned++;
    }

    // Set room status to RESERVED if previously available
    this.rooms = this.rooms.map(r => roomsToOccupied.has(r.id) && r.status === 'AVAILABLE' ? { ...r, status: 'RESERVED' } : r);

    localStorage.setItem(`${STORAGE_PREFIX}roomAssignments`, JSON.stringify(this.roomAssignments));
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
    localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));

    this.logAudit(user.name, user.role, 'AUTO_ASSIGN_ROOMS', 'Penempatan Kamar', `Auto assign ${assigned} tempat tidur untuk reservasi ${rsv.reservation_no}`, reservationId);

    return { assignedCount: assigned, message: `Berhasil menempatkan ${assigned} tamu secara otomatis.` };
  }

  // --- Check-in Operations ---
  public checkinReservation(reservationId: string, cardKeys: number, depositAmount: number, notes: string, user: User): boolean {
    const rsv = this.reservations.find(r => r.id === reservationId);
    if (!rsv) return false;

    const checkinNo = `CIN/${new Date().getFullYear()}/${(this.checkins.length + 1).toString().padStart(4, '0')}`;
    const checkinRecord: Checkin = {
      id: `chk-${Date.now()}`,
      reservation_id: reservationId,
      checkin_no: checkinNo,
      checkin_time: new Date().toISOString(),
      checkin_by: user.name,
      card_keys_issued: cardKeys,
      deposit_amount: depositAmount,
      notes,
    };

    this.checkins.unshift(checkinRecord);
    rsv.status = 'CHECKED_IN';
    rsv.updated_at = new Date().toISOString();

    // Mark assignments as CHECKED_IN
    const assignments = this.roomAssignments.filter(a => a.reservation_id === reservationId && a.status === 'ACTIVE');
    assignments.forEach(a => a.status = 'CHECKED_IN');

    // Update rooms and beds to OCCUPIED
    const assignedRoomIds = new Set(assignments.map(a => a.room_id));
    this.rooms = this.rooms.map(r => assignedRoomIds.has(r.id) ? { ...r, status: 'OCCUPIED' } : r);

    const assignedBedIds = new Set(assignments.map(a => a.bed_id));
    this.beds = this.beds.map(b => assignedBedIds.has(b.id) ? { ...b, status: 'OCCUPIED' } : b);

    // Recalculate occupied beds count for rooms
    this.rooms = this.rooms.map(r => {
      const roomBeds = this.beds.filter(b => b.room_id === r.id);
      const occupied = roomBeds.filter(b => b.status === 'OCCUPIED').length;
      return { ...r, occupied_beds: occupied };
    });

    localStorage.setItem(`${STORAGE_PREFIX}checkins`, JSON.stringify(this.checkins));
    localStorage.setItem(`${STORAGE_PREFIX}reservations`, JSON.stringify(this.reservations));
    localStorage.setItem(`${STORAGE_PREFIX}roomAssignments`, JSON.stringify(this.roomAssignments));
    localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));

    this.logAudit(user.name, user.role, 'CHECKIN', 'Check-in', `Proses check-in reservasi ${rsv.reservation_no}, nomor registrasi ${checkinNo}`, reservationId);
    this.addNotification('Tamu Telah Check-in', `Reservasi ${rsv.reservation_no} telah check-in oleh ${user.name}.`, 'CHECKIN', 'checkin', reservationId);

    return true;
  }

  // --- Check-out Operations ---
  public checkoutReservation(reservationId: string, conditionNotes: string, returnDeposit: boolean, notes: string, user: User): boolean {
    const rsv = this.reservations.find(r => r.id === reservationId);
    if (!rsv) return false;

    const checkoutNo = `COUT/${new Date().getFullYear()}/${(this.checkouts.length + 1).toString().padStart(4, '0')}`;
    const checkoutRecord: Checkout = {
      id: `co-${Date.now()}`,
      reservation_id: reservationId,
      checkout_no: checkoutNo,
      checkout_time: new Date().toISOString(),
      checkout_by: user.name,
      room_condition_notes: conditionNotes,
      deposit_returned: returnDeposit,
      notes,
    };

    this.checkouts.unshift(checkoutRecord);
    rsv.status = 'CHECKED_OUT';
    rsv.updated_at = new Date().toISOString();

    // Mark assignments as CHECKED_OUT
    const assignments = this.roomAssignments.filter(a => a.reservation_id === reservationId);
    assignments.forEach(a => a.status = 'CHECKED_OUT');

    // Get rooms that need to transition to CLEANING
    const affectedRoomIds = Array.from(new Set(assignments.map(a => a.room_id)));

    // Set rooms to CLEANING and create Housekeeping tasks
    this.rooms = this.rooms.map(r => {
      if (affectedRoomIds.includes(r.id)) {
        return {
          ...r,
          status: 'CLEANING',
          housekeeping_status: 'DIRTY',
          occupied_beds: 0,
        };
      }
      return r;
    });

    // Reset beds in those rooms to AVAILABLE
    this.beds = this.beds.map(b => affectedRoomIds.includes(b.room_id) ? { ...b, status: 'AVAILABLE', current_guest_id: undefined } : b);

    // Auto create Housekeeping tasks for affected rooms
    affectedRoomIds.forEach(roomId => {
      const room = this.rooms.find(r => r.id === roomId);
      const newTask: HousekeepingTask = {
        id: `hk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        room_id: roomId,
        task_type: 'POST_CHECKOUT',
        status: 'DIRTY',
        priority: 'HIGH',
        started_at: new Date().toISOString(),
        notes: `Pembersihan kamar pasca checkout ${rsv.reservation_no}. Kondisi: ${conditionNotes || 'Standar'}`,
        room_condition: conditionNotes,
        created_at: new Date().toISOString(),
      };
      this.housekeepingTasks.unshift(newTask);
    });

    localStorage.setItem(`${STORAGE_PREFIX}checkouts`, JSON.stringify(this.checkouts));
    localStorage.setItem(`${STORAGE_PREFIX}reservations`, JSON.stringify(this.reservations));
    localStorage.setItem(`${STORAGE_PREFIX}roomAssignments`, JSON.stringify(this.roomAssignments));
    localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
    localStorage.setItem(`${STORAGE_PREFIX}housekeepingTasks`, JSON.stringify(this.housekeepingTasks));

    this.logAudit(user.name, user.role, 'CHECKOUT', 'Check-out', `Proses checkout ${rsv.reservation_no}, nomor checkout ${checkoutNo}. Kamar dialihkan ke Housekeeping (DIRTY).`, reservationId);
    this.addNotification('Tamu Telah Checkout', `Reservasi ${rsv.reservation_no} telah checkout. Kamar dialihkan ke tim Housekeeping.`, 'CHECKOUT', 'housekeeping', reservationId);

    return true;
  }

  // --- Housekeeping Operations ---
  public updateHousekeepingTask(
    taskId: string, 
    status: HousekeepingStatus, 
    user: User, 
    notes?: string,
    roomStatus?: RoomStatus,
    assignedTo?: string
  ): boolean {
    const task = this.housekeepingTasks.find(t => t.id === taskId);
    if (!task) return false;

    task.status = status;
    if (notes !== undefined) task.notes = notes;
    if (assignedTo) task.assigned_to = assignedTo;

    if (status === 'IN_CLEANING') {
      task.started_at = task.started_at || new Date().toISOString();
      if (!task.assigned_to) task.assigned_to = user.name;
    } else if (status === 'INSPECTED' || status === 'READY') {
      task.completed_at = new Date().toISOString();
      task.inspected_by = user.name;
    }

    // Update Room housekeeping_status, room status, and notes
    const room = this.rooms.find(r => r.id === task.room_id);
    if (room) {
      room.housekeeping_status = status;
      if (notes !== undefined) {
        room.notes = notes;
      }
      
      // Determine physical room status
      if (roomStatus) {
        room.status = roomStatus;
      } else if (status === 'READY') {
        if (room.status !== 'OCCUPIED') {
          room.status = 'AVAILABLE';
        }
      } else if (status === 'DIRTY' || status === 'IN_CLEANING') {
        if (room.status !== 'OCCUPIED' && room.status !== 'MAINTENANCE') {
          room.status = 'CLEANING';
        }
      }

      // If room is now AVAILABLE, also ensure beds in this room are available (unless occupied or reserved)
      if (room.status === 'AVAILABLE') {
        this.beds = this.beds.map(b => {
          if (b.room_id === room.id && b.status !== 'OCCUPIED' && b.status !== 'RESERVED') {
            return { ...b, status: 'AVAILABLE' };
          }
          return b;
        });
        localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
      }
    }

    localStorage.setItem(`${STORAGE_PREFIX}housekeepingTasks`, JSON.stringify(this.housekeepingTasks));
    localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));

    this.logAudit(user.name, user.role, 'UPDATE_HOUSEKEEPING', 'Housekeeping', `Update status kebersihan kamar ${room?.room_number || ''} menjadi ${status} (${room?.status || ''})`, taskId);

    return true;
  }

  // --- Maintenance Operations ---
  public saveMaintenanceRequest(data: Partial<MaintenanceRequest>, user: User): MaintenanceRequest {
    if (data.id) {
      this.maintenanceRequests = this.maintenanceRequests.map(m => m.id === data.id ? { ...m, ...data } as MaintenanceRequest : m);
      localStorage.setItem(`${STORAGE_PREFIX}maintenanceRequests`, JSON.stringify(this.maintenanceRequests));
      return this.maintenanceRequests.find(m => m.id === data.id)!;
    } else {
      const ticketNo = `MNT/AHP/${new Date().getFullYear()}/${(this.maintenanceRequests.length + 1).toString().padStart(4, '0')}`;
      const newReq: MaintenanceRequest = {
        id: `mnt-${Date.now()}`,
        ticket_no: ticketNo,
        room_id: data.room_id,
        facility_id: data.facility_id,
        issue_category: data.issue_category || 'OTHER',
        priority: data.priority || 'MEDIUM',
        description: data.description || 'Laporan perbaikan fasilitas',
        reporter_name: user.name,
        assigned_technician: data.assigned_technician || 'Lukas Karoba (Teknisi)',
        status: 'OPEN',
        reported_at: new Date().toISOString(),
        estimated_cost: data.estimated_cost || 0,
        notes: data.notes,
      };

      // If priority is URGENT and room_id is set, set room status to MAINTENANCE
      if (data.room_id && (data.priority === 'HIGH' || data.priority === 'URGENT')) {
        this.updateRoomStatus(data.room_id, 'MAINTENANCE', undefined, `Perbaikan fasilitas (${ticketNo}): ${data.description}`);
      }

      this.maintenanceRequests.unshift(newReq);
      localStorage.setItem(`${STORAGE_PREFIX}maintenanceRequests`, JSON.stringify(this.maintenanceRequests));

      this.logAudit(user.name, user.role, 'CREATE_MAINTENANCE', 'Maintenance', `Laporan kerusakan baru tiket ${ticketNo}`, newReq.id);
      this.addNotification('Tiket Perbaikan Baru', `Laporan kerusakan ${ticketNo} dilaporkan untuk segera ditangani.`, 'MAINTENANCE', 'maintenance', newReq.id);

      return newReq;
    }
  }

  public completeMaintenanceRequest(ticketId: string, actualCost: number, notes: string, user: User): boolean {
    const req = this.maintenanceRequests.find(m => m.id === ticketId);
    if (!req) return false;

    req.status = 'COMPLETED';
    req.completed_at = new Date().toISOString();
    req.actual_cost = actualCost;
    req.notes = notes;

    // If it was a room maintenance, set room back to CLEANING or AVAILABLE
    if (req.room_id) {
      const room = this.rooms.find(r => r.id === req.room_id);
      if (room && room.status === 'MAINTENANCE') {
        this.updateRoomStatus(req.room_id, 'CLEANING', 'DIRTY', 'Selesai perbaikan, menunggu pembersihan');
      }
    }

    localStorage.setItem(`${STORAGE_PREFIX}maintenanceRequests`, JSON.stringify(this.maintenanceRequests));
    this.logAudit(user.name, user.role, 'COMPLETE_MAINTENANCE', 'Maintenance', `Menyelesaikan tiket perbaikan ${req.ticket_no}`, ticketId);

    return true;
  }

  // --- Payments & Invoices Operations ---
  public createPayment(
    invoiceId: string, 
    reservationId: string, 
    amount: number, 
    paymentMethod: Payment['payment_method'], 
    receivedFrom: string, 
    forPurpose: string, 
    user: User, 
    notes?: string
  ): Payment {
    const paymentNo = `PAY/AHP/${new Date().getFullYear()}/${(this.payments.length + 1).toString().padStart(4, '0')}`;
    const receiptNo = `KWT/AHP/${new Date().getFullYear()}/${(this.payments.length + 1).toString().padStart(4, '0')}`;
    const nominalTerbilang = terbilang(amount);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      payment_no: paymentNo,
      receipt_no: receiptNo,
      invoice_id: invoiceId,
      reservation_id: reservationId,
      amount,
      payment_date: new Date().toISOString(),
      payment_method: paymentMethod,
      terbilang: nominalTerbilang,
      received_from: receivedFrom,
      for_purpose: forPurpose,
      officer_name: user.name,
      notes,
      created_at: new Date().toISOString(),
    };

    this.payments.unshift(newPayment);

    // Update invoice paid_amount and balance_due
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (invoice) {
      invoice.paid_amount += amount;
      invoice.balance_due = Math.max(0, invoice.total_amount - invoice.paid_amount);
      if (invoice.balance_due <= 0) {
        invoice.status = 'PAID';
      } else {
        invoice.status = 'PARTIAL';
      }
    }

    // Update reservation paid_amount and payment_status
    const rsv = this.reservations.find(r => r.id === reservationId);
    if (rsv) {
      rsv.paid_amount += amount;
      rsv.remaining_amount = Math.max(0, rsv.total_amount - rsv.paid_amount);
      if (rsv.remaining_amount <= 0) {
        rsv.payment_status = 'PAID';
      } else {
        rsv.payment_status = 'PARTIAL';
      }
      rsv.updated_at = new Date().toISOString();
    }

    localStorage.setItem(`${STORAGE_PREFIX}payments`, JSON.stringify(this.payments));
    localStorage.setItem(`${STORAGE_PREFIX}invoices`, JSON.stringify(this.invoices));
    localStorage.setItem(`${STORAGE_PREFIX}reservations`, JSON.stringify(this.reservations));

    this.logAudit(user.name, user.role, 'CREATE_PAYMENT', 'Keuangan', `Menerbitkan pembayaran ${paymentNo} / Kwitansi ${receiptNo} sebesar Rp ${amount.toLocaleString('id-ID')}`, newPayment.id);
    this.addNotification('Pembayaran Diterima', `Pembayaran ${receiptNo} senilai Rp ${amount.toLocaleString('id-ID')} telah dicatat oleh ${user.name}.`, 'PAYMENT', 'payments', newPayment.id);

    return newPayment;
  }

  // --- Hospitality / Hotel PMS: Extra Folio Charges ---
  public addExtraChargeToInvoice(
    invoiceId: string, 
    description: string, 
    category: 'SERVICE' | 'FACILITY' | 'OTHER', 
    quantity: number, 
    unitPrice: number, 
    user: User
  ): { success: boolean; item?: InvoiceItem; invoice?: Invoice } {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (!invoice) return { success: false };

    const totalPrice = quantity * unitPrice;
    const newItem: InvoiceItem = {
      id: `inv-item-${Date.now()}`,
      invoice_id: invoiceId,
      description,
      category,
      quantity,
      unit: 'ITEM',
      unit_price: unitPrice,
      total_price: totalPrice,
    };

    this.invoiceItems.push(newItem);
    invoice.extra_charges = (invoice.extra_charges || 0) + totalPrice;
    invoice.subtotal += totalPrice;
    invoice.total_amount += totalPrice;
    invoice.balance_due = Math.max(0, invoice.total_amount - invoice.paid_amount);
    if (invoice.balance_due > 0 && invoice.paid_amount > 0) {
      invoice.status = 'PARTIAL';
    } else if (invoice.balance_due > 0 && invoice.paid_amount === 0) {
      invoice.status = 'UNPAID';
    }

    // Sync reservation remaining amount
    const rsv = this.reservations.find(r => r.id === invoice.reservation_id);
    if (rsv) {
      rsv.total_amount += totalPrice;
      rsv.remaining_amount = Math.max(0, rsv.total_amount - rsv.paid_amount);
      if (rsv.remaining_amount > 0 && rsv.paid_amount > 0) {
        rsv.payment_status = 'PARTIAL';
      } else if (rsv.remaining_amount > 0 && rsv.paid_amount === 0) {
        rsv.payment_status = 'UNPAID';
      }
      rsv.updated_at = new Date().toISOString();
    }

    localStorage.setItem(`${STORAGE_PREFIX}invoiceItems`, JSON.stringify(this.invoiceItems));
    localStorage.setItem(`${STORAGE_PREFIX}invoices`, JSON.stringify(this.invoices));
    localStorage.setItem(`${STORAGE_PREFIX}reservations`, JSON.stringify(this.reservations));

    this.logAudit(user.name, user.role, 'POST_FOLIO_CHARGE', 'Keuangan', `Posting biaya layanan hotel "${description}" sebesar Rp ${totalPrice.toLocaleString('id-ID')} pada invoice ${invoice.invoice_no}`, invoice.id);
    return { success: true, item: newItem, invoice };
  }

  // --- Hospitality / Hotel PMS: Walk-In Checkin ---
  public createWalkInCheckin(params: {
    guest: {
      fullName: string;
      nik: string;
      phone: string;
      gender: 'L' | 'P';
      guestType: Guest['guest_type'];
      regencyCity: string;
      institutionName?: string;
    };
    roomId: string;
    bedId: string;
    nights: number;
    depositAmount: number;
    cardKeys: number;
    initialPaymentAmount: number;
    paymentMethod: Payment['payment_method'];
    notes?: string;
    user: User;
  }): {
    success: boolean;
    message: string;
    reservation?: Reservation;
    guest?: Guest;
    invoice?: Invoice;
    payment?: Payment;
    checkin?: Checkin;
  } {
    const { guest: gData, roomId, bedId, nights, depositAmount, cardKeys, initialPaymentAmount, paymentMethod, notes, user } = params;

    const room = this.rooms.find(r => r.id === roomId);
    const bed = this.beds.find(b => b.id === bedId);
    if (!room || !bed) {
      return { success: false, message: 'Kamar atau tempat tidur tidak ditemukan.' };
    }

    // 1. Create or find Guest
    const newGuest = this.saveGuest({
      full_name: gData.fullName,
      nik: gData.nik,
      phone: gData.phone,
      gender: gData.gender,
      guest_type: gData.guestType,
      regency_city: gData.regencyCity,
      address: `${gData.regencyCity}, Papua`,
    });

    // 2. Dates
    const checkinDate = '2026-09-26';
    const checkoutDateObj = new Date(2026, 8, 26 + nights);
    const y = checkoutDateObj.getFullYear();
    const m = String(checkoutDateObj.getMonth() + 1).padStart(2, '0');
    const d = String(checkoutDateObj.getDate()).padStart(2, '0');
    const checkoutDate = `${y}-${m}-${d}`;

    const totalRate = room.rate_per_night * nights;

    // 3. Create Reservation (auto CHECKED_IN)
    const reservationNo = this.generateReservationNo();
    const newRsv: Reservation = {
      id: `rsv-${Date.now()}`,
      reservation_no: reservationNo,
      reservation_date: new Date().toISOString(),
      reservation_type: 'INDIVIDUAL',
      guest_id: newGuest.id,
      activity_type: gData.guestType,
      activity_name: gData.institutionName ? `Tamu Kedinasan ${gData.institutionName}` : 'Tamu Walk-In Asrama Haji',
      checkin_date: checkinDate,
      checkout_date: checkoutDate,
      total_guests: 1,
      male_count: gData.gender === 'L' ? 1 : 0,
      female_count: gData.gender === 'P' ? 1 : 0,
      total_rooms_requested: 1,
      status: 'CHECKED_IN',
      payment_status: initialPaymentAmount >= totalRate ? 'PAID' : (initialPaymentAmount > 0 ? 'PARTIAL' : 'UNPAID'),
      total_amount: totalRate,
      paid_amount: Math.min(totalRate, initialPaymentAmount),
      remaining_amount: Math.max(0, totalRate - initialPaymentAmount),
      notes: notes || 'Registrasi Langsung (Walk-In Guest)',
      spma_no: this.generateSpmaNo(),
      package_type: 'REGULER',
      created_by: user.name,
      verified_by: user.name,
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.reservations.unshift(newRsv);

    // 4. Create Room Assignment
    const newAssignment: RoomAssignment = {
      id: `ra-${Date.now()}`,
      reservation_id: newRsv.id,
      guest_id: newGuest.id,
      room_id: roomId,
      bed_id: bedId,
      assigned_at: new Date().toISOString(),
      assigned_by: user.name,
      status: 'CHECKED_IN',
    };
    this.roomAssignments.push(newAssignment);

    // 5. Update Room & Bed status to OCCUPIED
    room.status = 'OCCUPIED';
    bed.status = 'OCCUPIED';
    bed.current_guest_id = newGuest.id;
    const roomBeds = this.beds.filter(b => b.room_id === room.id);
    room.occupied_beds = roomBeds.filter(b => b.status === 'OCCUPIED').length;

    // 6. Create Checkin Record
    const checkinNo = `CIN/${new Date().getFullYear()}/${(this.checkins.length + 1).toString().padStart(4, '0')}`;
    const newCheckin: Checkin = {
      id: `chk-${Date.now()}`,
      reservation_id: newRsv.id,
      checkin_no: checkinNo,
      checkin_time: new Date().toISOString(),
      checkin_by: user.name,
      card_keys_issued: cardKeys,
      deposit_amount: depositAmount,
      notes: notes || 'Walk-in Registration',
    };
    this.checkins.unshift(newCheckin);

    // 7. Create Invoice
    const invoiceNo = `INV/AHP/${new Date().getFullYear()}/${(this.invoices.length + 1).toString().padStart(4, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoice_no: invoiceNo,
      reservation_id: newRsv.id,
      bill_to_name: gData.fullName,
      institution_name: gData.institutionName,
      issue_date: checkinDate,
      due_date: checkoutDate,
      subtotal: totalRate,
      discount_amount: 0,
      tax_amount: 0,
      extra_charges: 0,
      total_amount: totalRate,
      paid_amount: Math.min(totalRate, initialPaymentAmount),
      balance_due: Math.max(0, totalRate - initialPaymentAmount),
      status: initialPaymentAmount >= totalRate ? 'PAID' : (initialPaymentAmount > 0 ? 'PARTIAL' : 'UNPAID'),
      pnbp_account_code: '425112',
      pnbp_account_name: 'Pendapatan Sewa Kamar Asrama Haji / Wisma',
      simponi_billing_code: this.generateSimponiBillingCode(),
      billing_expired_at: checkoutDate,
      notes: `Faktur sewa kamar Walk-In ${room.room_number} (${nights} malam)`,
      created_at: new Date().toISOString(),
    };
    this.invoices.unshift(newInvoice);

    // 8. Create Invoice Item
    const newInvItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      invoice_id: newInvoice.id,
      description: `Sewa Kamar ${room.room_number} (${nights} malam)`,
      category: 'ROOM',
      quantity: nights,
      unit: 'MALAM',
      unit_price: room.rate_per_night,
      total_price: totalRate,
    };
    this.invoiceItems.push(newInvItem);

    // 9. Process initial payment if provided
    let newPayment: Payment | undefined;
    if (initialPaymentAmount > 0) {
      newPayment = this.createPayment(
        newInvoice.id,
        newRsv.id,
        initialPaymentAmount,
        paymentMethod,
        gData.fullName,
        `Pembayaran Sewa Kamar Walk-in ${room.room_number}`,
        user,
        'Pembayaran langsung saat check-in'
      );
    }

    // Persist all
    localStorage.setItem(`${STORAGE_PREFIX}reservations`, JSON.stringify(this.reservations));
    localStorage.setItem(`${STORAGE_PREFIX}roomAssignments`, JSON.stringify(this.roomAssignments));
    localStorage.setItem(`${STORAGE_PREFIX}rooms`, JSON.stringify(this.rooms));
    localStorage.setItem(`${STORAGE_PREFIX}beds`, JSON.stringify(this.beds));
    localStorage.setItem(`${STORAGE_PREFIX}checkins`, JSON.stringify(this.checkins));
    localStorage.setItem(`${STORAGE_PREFIX}invoices`, JSON.stringify(this.invoices));
    localStorage.setItem(`${STORAGE_PREFIX}invoiceItems`, JSON.stringify(this.invoiceItems));

    this.logAudit(user.name, user.role, 'WALK_IN_CHECKIN', 'Front Desk', `Check-in langsung tamu walk-in ${gData.fullName} di kamar ${room.room_number} (${nights} malam)`, newRsv.id);
    this.addNotification('Tamu Walk-In Berhasil Check-in', `Tamu ${gData.fullName} berhasil check-in di Kamar ${room.room_number}.`, 'CHECKIN', 'checkin', newRsv.id);

    return {
      success: true,
      message: `Tamu Walk-in ${gData.fullName} berhasil check-in di Kamar ${room.room_number}.`,
      reservation: newRsv,
      guest: newGuest,
      invoice: newInvoice,
      payment: newPayment,
      checkin: newCheckin,
    };
  }

  // --- Munakosah Papua: Self-Service Room & Bed Lookup ---
  public lookupAccommodation(query: string): {
    found: boolean;
    guest?: Guest;
    reservation?: Reservation;
    room?: Room;
    bed?: Bed;
    building?: Building;
    message?: string;
  } {
    const q = query.trim().toLowerCase();
    if (!q) return { found: false, message: 'Harap masukkan kata kunci pencarian (NIK, Nama, No. HP, No. Porsi, atau No. Reservasi).' };

    // Find guest by NIK, phone, or name
    const guest = this.guests.find(g => 
      g.nik.toLowerCase().includes(q) || 
      g.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) || 
      g.full_name.toLowerCase().includes(q)
    );

    // Or find reservation directly by reservation_no, spma_no, or simponi_billing_code
    let rsv = this.reservations.find(r => 
      r.reservation_no.toLowerCase().includes(q) || 
      (r.spma_no && r.spma_no.toLowerCase().includes(q)) ||
      (r.simponi_billing_code && r.simponi_billing_code.toLowerCase().includes(q))
    );

    if (!rsv && guest) {
      rsv = this.reservations.find(r => r.guest_id === guest.id);
    }

    if (!rsv && !guest) {
      return { found: false, message: `Data akomodasi untuk "${query}" tidak ditemukan dalam sistem.` };
    }

    const matchedGuest = guest || (rsv?.guest_id ? this.guests.find(g => g.id === rsv!.guest_id) : undefined);
    
    // Find room assignment
    let assignment = this.roomAssignments.find(a => 
      (rsv && a.reservation_id === rsv.id) || 
      (matchedGuest && a.guest_id === matchedGuest.id)
    );

    let room: Room | undefined;
    let bed: Bed | undefined;
    let building: Building | undefined;

    if (assignment) {
      room = this.rooms.find(r => r.id === assignment!.room_id);
      bed = this.beds.find(b => b.id === assignment!.bed_id);
      if (room) {
        building = this.buildings.find(b => b.id === room!.building_id);
      }
    } else if (rsv) {
      const reservedBed = this.beds.find(b => b.current_guest_id === matchedGuest?.id);
      if (reservedBed) {
        bed = reservedBed;
        room = this.rooms.find(r => r.id === reservedBed.room_id);
        if (room) building = this.buildings.find(b => b.id === room!.building_id);
      }
    }

    return {
      found: true,
      guest: matchedGuest,
      reservation: rsv,
      room,
      bed,
      building,
    };
  }

  // --- Settings Update ---
  public updateSettings(newSettings: Partial<AppSettings>, user: User): AppSettings {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(this.settings));
    this.logAudit(user.name, user.role, 'UPDATE_SETTINGS', 'Sistem', 'Memperbarui pengaturan identitas dan rekening instansi');
    return { ...this.settings };
  }
}

// Singleton database instance
export const db = new DatabaseService();
