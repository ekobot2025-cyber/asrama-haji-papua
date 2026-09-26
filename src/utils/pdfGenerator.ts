import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Core HTML-to-PDF Engine
 * Captures any DOM element container and returns jsPDF instance, Blob, and Blob URL.
 */
export async function generatePdfBlobFromElement(
  element: HTMLElement,
  options: {
    orientation?: 'portrait' | 'landscape';
    scale?: number;
    fitToSinglePage?: boolean;
  } = {}
): Promise<{ pdf: jsPDF; blob: Blob; blobUrl: string }> {
  const { orientation = 'portrait', scale = 2.5, fitToSinglePage = false } = options;

  // 1. Temporarily prepare element for document capture (remove web borders, shadows, rounded corners)
  const originalShadow = element.style.boxShadow;
  const originalRadius = element.style.borderRadius;
  const originalBorder = element.style.border;
  const originalBg = element.style.backgroundColor;

  element.style.boxShadow = 'none';
  element.style.borderRadius = '0';
  element.style.border = 'none';
  element.style.backgroundColor = '#ffffff';

  // Also remove border & shadow from direct child wrapper if present
  const innerCard = element.querySelector('.border') as HTMLElement | null;
  const originalInnerBorder = innerCard ? innerCard.style.border : '';
  const originalInnerShadow = innerCard ? innerCard.style.boxShadow : '';
  const originalInnerRadius = innerCard ? innerCard.style.borderRadius : '';
  if (innerCard) {
    innerCard.style.border = 'none';
    innerCard.style.boxShadow = 'none';
    innerCard.style.borderRadius = '0';
  }

  try {
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200,
    });

    const isLandscape = orientation === 'landscape';
    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    if (fitToSinglePage) {
      // Force strictly 1 single A4 page with proportional fit
      let imgWidth = pdfWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      const xOffset = Math.max(0, (pdfWidth - imgWidth) / 2);
      const yOffset = Math.max(0, (pdfHeight - imgHeight) / 2);

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Multi-page support if document is longer than 1 A4 page
      while (heightLeft > 5) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    return { pdf, blob, blobUrl };
  } finally {
    // Restore original styles
    element.style.boxShadow = originalShadow;
    element.style.borderRadius = originalRadius;
    element.style.border = originalBorder;
    element.style.backgroundColor = originalBg;

    if (innerCard) {
      innerCard.style.border = originalInnerBorder;
      innerCard.style.boxShadow = originalInnerShadow;
      innerCard.style.borderRadius = originalInnerRadius;
    }
  }
}

/**
 * Universal HTML-to-PDF Downloader
 * Captures any DOM document container, strips web UI artifacts (shadows, rounded corners),
 * renders at retina 2.5x resolution, and saves directly as an A4 .pdf file.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string,
  options: {
    orientation?: 'portrait' | 'landscape';
    openInNewTab?: boolean;
    scale?: number;
    fitToSinglePage?: boolean;
  } = {}
): Promise<{ pdf: jsPDF; blob: Blob; blobUrl: string }> {
  const { openInNewTab = false } = options;
  const result = await generatePdfBlobFromElement(element, options);

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  if (openInNewTab) {
    window.open(result.blobUrl, '_blank');
  }

  // Trigger direct file download
  result.pdf.save(cleanFilename);
  return result;
}

/**
 * Direct Print Without Opening New Tab
 * Prints the document cleanly inside an invisible iframe directly on the current page.
 * Uses exact A4 print styles to avoid browser headers, footers, and modal borders.
 */
export function printElementDirectly(
  element: HTMLElement, 
  title = 'Cetak Dokumen',
  options: { orientation?: 'portrait' | 'landscape' } = {}
): void {
  const { orientation = 'portrait' } = options;
  // Remove existing print iframe if any
  const existingIframe = document.getElementById('ahp-direct-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'ahp-direct-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  // Collect active stylesheets
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${styles}
        <style>
          @page {
            size: A4 ${orientation};
            margin: 6mm 10mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            color: #0f172a !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .print-a4-sheet {
            width: 100%;
            max-width: 190mm;
            margin: 0 auto;
            background: white;
            box-sizing: border-box;
          }
        </style>
      </head>
      <body>
        <div class="print-a4-sheet">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Direct print error:', err);
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 10000);
      }
    }, 300);
  };
}

/**
 * Direct Vector PDF Generator for Official Reports & Recap
 * Uses pure jsPDF + jspdf-autotable to output razor-sharp, searchable vector PDF documents
 */
export function generateFormalReportPdf(options: {
  title: string;
  subtitle?: string;
  reportType: string;
  dateRange: string;
  headers: string[];
  rows: (string | number)[][];
  summaryStats?: Array<{ label: string; value: string }>;
  orientation?: 'portrait' | 'landscape';
  filename?: string;
}): void {
  const {
    title,
    subtitle,
    dateRange,
    headers,
    rows,
    summaryStats = [],
    orientation = 'portrait',
    filename,
  } = options;

  const doc = new jsPDF({
    orientation: orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = orientation === 'landscape' ? 297 : 210;

  // 1. Official Kop Surat Kemenag Papua
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('KEMENTERIAN AGAMA REPUBLIK INDONESIA', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(15, 81, 50); // Emerald Deep
  doc.text('KANTOR WILAYAH KEMENTERIAN AGAMA PROVINSI PAPUA', pageWidth / 2, 19, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('UPT ASRAMA HAJI PROVINSI PAPUA', pageWidth / 2, 23.5, { align: 'center' });
  doc.text('Jl. Asrama Haji No. 01, Jayapura • Telp: (0967) 581-229 • Email: asramahaji.papua@kemenag.go.id', pageWidth / 2, 27.5, { align: 'center' });

  // Double horizontal separator line
  doc.setDrawColor(15, 81, 50);
  doc.setLineWidth(0.8);
  doc.line(14, 30, pageWidth - 14, 30);
  doc.setLineWidth(0.2);
  doc.line(14, 31, pageWidth - 14, 31);

  // 2. Report Title & Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), pageWidth / 2, 38, { align: 'center' });

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, pageWidth / 2, 43, { align: 'center' });
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode: ${dateRange}`, 14, 49);
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} (WIT)`, pageWidth - 14, 49, { align: 'right' });

  let startY = 53;

  // 3. Summary Stats (if any)
  if (summaryStats.length > 0) {
    const cardWidth = (pageWidth - 28 - (summaryStats.length - 1) * 4) / summaryStats.length;
    summaryStats.forEach((stat, i) => {
      const x = 14 + i * (cardWidth + 4);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, startY, cardWidth, 14, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(stat.label, x + cardWidth / 2, startY + 5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 81, 50);
      doc.text(stat.value, x + cardWidth / 2, startY + 11, { align: 'center' });
    });
    startY += 19;
  }

  // 4. Data Table with jspdf-autotable
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: startY,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: [15, 81, 50],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14, bottom: 35 },
    didDrawPage: (data) => {
      // Footer page numbering
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `SIMAHA — Sistem Informasi Manajemen Asrama Haji Provinsi Papua | Halaman ${doc.getNumberOfPages()}`,
        pageWidth / 2,
        orientation === 'landscape' ? 202 : 289,
        { align: 'center' }
      );
    },
  });

  // 5. Official Signature Block
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const pageBottom = orientation === 'landscape' ? 190 : 275;

  if (finalY + 30 > pageBottom) {
    doc.addPage();
  }

  const sigY = finalY + 30 > pageBottom ? 20 : finalY;
  const sigX = pageWidth - 65;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Jayapura, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, sigX, sigY);
  doc.text('Kepala UPT Asrama Haji Papua', sigX, sigY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.text('H. Ahmad Fauzi, S.Ag., M.Si', sigX, sigY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('NIP. 19750814 200212 1 003', sigX, sigY + 26);

  // Save PDF
  const defaultFilename = `Laporan_SIMAHA_Papua_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename || defaultFilename);
}
