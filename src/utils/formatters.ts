/**
 * Utilitas pemformatan data dalam bahasa Indonesia & standar SIPAH PAPUA
 */

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatRupiah = formatCurrency;

export function formatDateIndo(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

export function formatDateTimeIndo(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);

    const dateFormatted = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);

    return `${dateFormatted} WIT`;
  } catch {
    return String(dateStr);
  }
}

export function formatShortDateIndo(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateStr);
  }
}

/**
 * Masking NIK: 16 digit -> 6 digit awal, 6 digit bintang, 4 digit akhir
 * Contoh: 9171012304950003 -> 917101******0003
 */
export function maskNik(nik: string | undefined | null): string {
  if (!nik) return '-';
  const clean = nik.replace(/\s+/g, '');
  if (clean.length < 10) return clean;
  return `${clean.substring(0, 6)}******${clean.substring(clean.length - 4)}`;
}

export function calculateNights(checkinDate: string, checkoutDate: string): number {
  if (!checkinDate || !checkoutDate) return 1;
  const start = new Date(checkinDate);
  const end = new Date(checkoutDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function getStatusColor(status: string): { bg: string; text: string; border: string; dot: string } {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
    case 'READY':
    case 'PAID':
    case 'COMPLETED':
    case 'CONFIRMED':
    case 'ACTIVE':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
    
    case 'OCCUPIED':
    case 'CHECKED_IN':
    case 'IN_PROGRESS':
    case 'IN_CLEANING':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' };
    
    case 'RESERVED':
    case 'VERIFIED':
    case 'INSPECTED':
    case 'PARTIAL':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' };
    
    case 'CLEANING':
    case 'DIRTY':
    case 'PENDING':
    case 'DRAFT':
    case 'UNPAID':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' };
    
    case 'MAINTENANCE':
    case 'CANCELLED':
    case 'REJECTED':
    case 'REFUNDED':
    case 'URGENT':
    case 'HIGH':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };

    case 'CHECKED_OUT':
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };

    default:
      return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' };
  }
}
