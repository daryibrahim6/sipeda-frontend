import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MonthlyTrend, BloodTypeDist, StatusRate, GenderDist } from './admin-api';

type ReportData = {
  month: string;
  monthlyTrends: MonthlyTrend[];
  bloodTypeDist: BloodTypeDist[];
  successRate: StatusRate[];
  genderDist: GenderDist[];
  stats: {
    total_stok: number;
    total_stok_kritis: number;
    registrasi_bulan_ini: number;
    jadwal_aktif: number;
  };
};

const PRIMARY = '#C62828';
const DARK = '#1A1410';
const MUTED = '#6B6258';

export function generateMonthlyReport(data: ReportData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  // ── Header ──
  doc.setFillColor(198, 40, 40);
  doc.rect(0, 0, pageW, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SIPEDA — Laporan Bulanan', pageW / 2, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PMI Kabupaten Indramayu', pageW / 2, 30, { align: 'center' });
  y = 50;

  // ── Title ──
  const [yStr, mStr] = data.month.split('-');
  const monthName = new Date(+yStr, +mStr - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  doc.setTextColor(DARK);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Periode: ${monthName}`, margin, y);
  doc.setDrawColor(PRIMARY);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 3, pageW - margin, y + 3);
  y += 12;

  // ── Summary Stats ──
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Ringkasan', margin, y);
  y += 6;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: contentW,
    body: [
      ['Total Stok Darah', String(data.stats.total_stok), 'Stok Kritis', String(data.stats.total_stok_kritis)],
      ['Registrasi Bulan Ini', String(data.stats.registrasi_bulan_ini), 'Jadwal Aktif', String(data.stats.jadwal_aktif)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [198, 40, 40] },
    styles: { fontSize: 9, cellPadding: 3 },
    columns: [
      { header: 'Metrik', dataKey: '0' },
      { header: 'Nilai', dataKey: '1' },
      { header: 'Metrik', dataKey: '2' },
      { header: 'Nilai', dataKey: '3' },
    ],
  });
  const docWt = doc as jsPDF & { lastAutoTable: { finalY: number } };
  y = docWt.lastAutoTable.finalY + 10;

  // ── Monthly Trend Table ──
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tren Donasi Bulanan', margin, y);
  y += 6;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: contentW,
    head: [['Bulan', 'Berhasil', 'Gagal', 'TMS', 'Total']],
    body: data.monthlyTrends.map(m => {
      const [yStr, mStr] = m.bulan.split('-');
      const label = new Date(+yStr, +mStr - 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      return [label, String(m.berhasil), String(m.gagal), String(m.tms), String(m.berhasil + m.gagal + m.tms)];
    }),
    theme: 'grid',
    headStyles: { fillColor: [198, 40, 40] },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      4: { fontStyle: 'bold' },
    },
  });
  y = docWt.lastAutoTable.finalY + 10;

  // ── Blood Type Distribution ──
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribusi Golongan Darah (Donor Berhasil)', margin, y);
  y += 6;
  const btTotal = data.bloodTypeDist.reduce((a, b) => a + b.total, 0) || 1;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: contentW,
    head: [['Golongan Darah', 'Jumlah', 'Persentase']],
    body: data.bloodTypeDist.map(d => [
      d.golongan_darah,
      String(d.total),
      `${Math.round((d.total / btTotal) * 100)}%`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [198, 40, 40] },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });
  y = docWt.lastAutoTable.finalY + 10;

  // ── Two columns: Gender + Success Rate ──
  const colW = contentW / 2 - 4;

  // Gender
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Demografi Jenis Kelamin', margin, y);
  y += 6;
  const gTotal = data.genderDist.reduce((a, b) => a + b.total, 0) || 1;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    tableWidth: colW,
    head: [['Jenis Kelamin', 'Jumlah', '%']],
    body: data.genderDist.map(d => [d.jenis_kelamin, String(d.total), `${Math.round((d.total / gTotal) * 100)}%`]),
    theme: 'grid',
    headStyles: { fillColor: [198, 40, 40] },
    styles: { fontSize: 8, cellPadding: 2 },
  });
  const genderEndY = docWt.lastAutoTable.finalY;

  // Success rate — position to the right
  const srX = margin + colW + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tingkat Keberhasilan', srX, y - 6);
  autoTable(doc, {
    startY: y,
    margin: { left: srX, right: margin },
    tableWidth: colW,
    head: [['Status', 'Jumlah', '%']],
    body: data.successRate.map(d => [
      d.status === 'berhasil' ? 'Berhasil' : d.status === 'gagal' ? 'Gagal' : 'TMS',
      String(d.total),
      `${d.persen}%`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [198, 40, 40] },
    styles: { fontSize: 8, cellPadding: 2 },
  });
  y = Math.max(genderEndY, docWt.lastAutoTable.finalY) + 10;

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(
      `Laporan SIPEDA — ${monthName} | Hal ${i} dari ${pageCount}`,
      pageW / 2,
      290,
      { align: 'center' },
    );
    doc.text(
      `Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
      pageW / 2,
      295,
      { align: 'center' },
    );
  }

  doc.save(`laporan-sipeda-${data.month}.pdf`);
}
