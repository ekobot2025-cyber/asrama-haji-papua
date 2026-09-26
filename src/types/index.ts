export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN_PENGINAPAN' 
  | 'PETUGAS' 
  | 'KEUANGAN' 
  | 'HOUSEKEEPING' 
  | 'PIMPINAN';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  status: 'ACTIVE' | 'INACTIVE';
  last_login?: string;
  created_at: string;
}

export interface Building {
  id: string;
  code: string;
  name: string;
  total_floors: number;
  description: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  created_at: string;
}

export interface Floor {
  id: string;
  building_id: string;
  floor_number: number;
  name: string;
  description?: string;
}

export interface RoomType {
  id: string;
  code: string;
  name: string;
  description: string;
  default_capacity: number;
  base_rate_per_night: number;
  amenities: string[];
}

export type RoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE';
export type HousekeepingStatus = 'DIRTY' | 'IN_CLEANING' | 'INSPECTED' | 'READY';

export interface Room {
  id: string;
  room_number: string;
  building_id: string;
  floor_id: string;
  room_type_id: string;
  capacity: number;
  total_beds: number;
  occupied_beds?: number;
  rate_per_night: number;
  status: RoomStatus;
  housekeeping_status: HousekeepingStatus;
  amenities: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export interface Bed {
  id: string;
  bed_code: string;
  room_id: string;
  status: BedStatus;
  current_guest_id?: string;
  notes?: string;
}

export type GuestType = 
  | 'JAMAAH' 
  | 'KEDINASAN' 
  | 'PELATIHAN' 
  | 'MANASIK' 
  | 'UMUM' 
  | 'ROMBONGAN' 
  | 'PEGAWAI';

export interface Institution {
  id: string;
  name: string;
  type: 'KEMENAG' | 'PEMDA' | 'DINAS' | 'SWASTA' | 'KOMUNITAS' | 'LAINNYA';
  address: string;
  phone: string;
  contact_person: string;
  email?: string;
}

export interface Guest {
  id: string;
  nik: string; // Stored securely; UI displays masked: 917101******0003
  full_name: string;
  gender: 'L' | 'P'; // L = Laki-laki, P = Perempuan
  phone: string;
  email?: string;
  institution_id?: string;
  guest_type: GuestType;
  regency_city: string; // Kabupaten / Kota (e.g., Kota Jayapura, Kab. Merauke)
  province: string; // Provinsi (e.g., Papua, Papua Selatan, Papua Tengah)
  address: string;
  notes?: string;
  stay_count: number;
  created_at: string;
}

export interface Group {
  id: string;
  group_name: string;
  activity_name: string;
  institution_id?: string;
  pic_name: string;
  pic_phone: string;
  pic_email?: string;
  total_members: number;
  male_count: number;
  female_count: number;
  checkin_date: string;
  checkout_date: string;
  notes?: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  guest_id: string;
  room_id?: string;
  bed_id?: string;
  assigned_at?: string;
}

export type ReservationStatus = 
  | 'DRAFT' 
  | 'PENDING' 
  | 'VERIFIED' 
  | 'CONFIRMED' 
  | 'CHECKED_IN' 
  | 'CHECKED_OUT' 
  | 'CANCELLED' 
  | 'REJECTED';

export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';

export interface Reservation {
  id: string;
  reservation_no: string; // RSV/AHP/2026/00001
  reservation_date: string;
  reservation_type: 'INDIVIDUAL' | 'ROMBONGAN' | 'INSTANSI' | 'KEGIATAN';
  guest_id?: string; // PIC for individual
  group_id?: string; // If group
  institution_id?: string;
  activity_type: string; // Haji, Manasik, Bimtek, Pelatihan, Kedinasan, Umum
  activity_name?: string;
  checkin_date: string;
  checkout_date: string;
  total_guests: number;
  male_count: number;
  female_count: number;
  total_rooms_requested: number;
  facility_requirements?: string;
  status: ReservationStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  notes?: string;
  spma_no?: string; // SPMA/AHP/2026/00123
  package_type?: 'REGULER' | 'FULLBOARD_DIKLAT' | 'MANASIK_AKBAR' | 'HALFDAY_MEETING';
  created_by: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RoomAssignment {
  id: string;
  reservation_id: string;
  guest_id: string;
  room_id: string;
  bed_id: string;
  assigned_at: string;
  assigned_by: string;
  status: 'ACTIVE' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
}

export interface Checkin {
  id: string;
  reservation_id: string;
  checkin_no: string;
  checkin_time: string;
  checkin_by: string;
  card_keys_issued: number;
  deposit_amount: number;
  notes?: string;
}

export interface Checkout {
  id: string;
  reservation_id: string;
  checkout_no: string;
  checkout_time: string;
  checkout_by: string;
  room_condition_notes: string;
  deposit_returned: boolean;
  notes?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'AULA' | 'RUANG_RAPAT' | 'RUANG_KELAS' | 'MASJID' | 'RUANG_MAKAN' | 'LAPANGAN_MANASIK' | 'LAINNYA';
  location: string;
  capacity: number;
  daily_rate: number;
  hourly_rate?: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  description: string;
  amenities: string[];
}

export interface FacilityReservation {
  id: string;
  facility_id: string;
  reservation_id?: string;
  organizer_name: string;
  event_name: string;
  start_datetime: string;
  end_datetime: string;
  total_rate: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

export interface RateItem {
  id: string;
  name: string;
  category: 'KAMAR' | 'FASILITAS' | 'LAYANAN';
  target_id?: string; // room_type_id or facility_id
  user_type: string; // Kemenag, Instansi Pemerintah, Swasta, Jamaah, Umum
  unit: 'PER_NIGHT' | 'PER_PERSON' | 'PER_ROOM' | 'PER_EVENT' | 'PER_HOUR';
  rate: number;
  description?: string;
  is_active: boolean;
  effective_date: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  category: 'ROOM' | 'FACILITY' | 'SERVICE' | 'OTHER';
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  id: string;
  invoice_no: string; // INV/AHP/2026/0001
  reservation_id: string;
  bill_to_name: string;
  institution_name?: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  extra_charges: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  pnbp_account_code?: string; // 425111, 425112, 425113
  pnbp_account_name?: string; // e.g. Pendapatan Sewa Kamar Asrama Haji
  simponi_billing_code?: string; // 15-digit Kode Billing MPN-G3 SIMPONI Kemenkeu
  billing_expired_at?: string;
  spk_contract_no?: string; // SPK/AHP/KS/2026/042
  notes?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  payment_no: string; // PAY/AHP/2026/0001
  receipt_no: string; // KWT/AHP/2026/0001 (Kwitansi)
  invoice_id: string;
  reservation_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'CASH' | 'TRANSFER_BPD_PAPUA' | 'TRANSFER_BSI' | 'TRANSFER_BRI' | 'QRIS';
  terbilang: string;
  received_from: string;
  for_purpose: string;
  officer_name: string;
  notes?: string;
  created_at: string;
}

export interface HousekeepingTask {
  id: string;
  room_id: string;
  task_type: 'POST_CHECKOUT' | 'REGULAR_CLEAN' | 'DEEP_CLEAN' | 'LINEN_CHANGE' | 'INSPECTION';
  status: HousekeepingStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assigned_to?: string;
  started_at?: string;
  completed_at?: string;
  inspected_by?: string;
  notes?: string;
  room_condition?: string;
  created_at: string;
}

export interface MaintenanceRequest {
  id: string;
  ticket_no: string; // MNT/AHP/2026/0001
  room_id?: string;
  facility_id?: string;
  issue_category: 'AC_HVAC' | 'PLUMBING' | 'ELECTRICAL' | 'FURNITURE' | 'CIVIL' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
  reporter_name: string;
  assigned_technician?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reported_at: string;
  completed_at?: string;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'RESERVATION' | 'CHECKIN' | 'CHECKOUT' | 'PAYMENT' | 'MAINTENANCE' | 'HOUSEKEEPING' | 'SYSTEM';
  is_read: boolean;
  link_page?: string;
  link_id?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  module: string;
  target_id?: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface AppSettings {
  app_name: string;
  app_title: string;
  app_subtitle: string;
  organization_name: string;
  address: string;
  city: string;
  province: string;
  phone: string;
  email: string;
  head_officer: string;
  head_nip: string;
  bank_bpd_papua: string;
  bank_bsi: string;
  bank_bri: string;
  checkin_time_default: string;
  checkout_time_default: string;
  timezone: string;
}
