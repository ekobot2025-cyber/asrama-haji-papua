/**
 * Helper Konversi Angka ke Terbilang Bahasa Indonesia
 * Contoh: 1500000 -> "Satu Juta Lima Ratus Ribu Rupiah"
 */
export function terbilang(nominal: number): string {
  if (nominal === 0) return 'Nol Rupiah';
  
  const bilangan: string[] = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function toWords(n: number): string {
    let result = '';
    n = Math.floor(Math.abs(n));

    if (n < 12) {
      result = ' ' + bilangan[n];
    } else if (n < 20) {
      result = toWords(n - 10) + ' Belas';
    } else if (n < 100) {
      result = toWords(Math.floor(n / 10)) + ' Puluh' + toWords(n % 10);
    } else if (n < 200) {
      result = ' Seratus' + toWords(n - 100);
    } else if (n < 1000) {
      result = toWords(Math.floor(n / 100)) + ' Ratus' + toWords(n % 100);
    } else if (n < 2000) {
      result = ' Seribu' + toWords(n - 1000);
    } else if (n < 1000000) {
      result = toWords(Math.floor(n / 1000)) + ' Ribu' + toWords(n % 1000);
    } else if (n < 1000000000) {
      result = toWords(Math.floor(n / 1000000)) + ' Juta' + toWords(n % 1000000);
    } else if (n < 1000000000000) {
      result = toWords(Math.floor(n / 1000000000)) + ' Milyar' + toWords(n % 1000000000);
    } else if (n < 1000000000000000) {
      result = toWords(Math.floor(n / 1000000000000)) + ' Triliun' + toWords(n % 1000000000000);
    }

    return result;
  }

  const hasil = toWords(nominal).trim();
  return `${hasil} Rupiah`;
}
