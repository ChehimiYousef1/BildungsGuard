import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Auto-compiles attendance, test results and activities into one sheet.
export async function generateErgebnisbogen(data: {
  participant: string;
  measure: string;
  attendanceRate?: number;
  results?: { label: string; value: string }[];
}): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const body = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawText('Ergebnisbogen', { x: 60, y: 780, size: 24, font, color: rgb(0.43, 0.36, 0.96) });
  page.drawText(`${data.participant} - ${data.measure}`, { x: 60, y: 748, size: 12, font: body });
  page.drawText(`Anwesenheitsquote: ${data.attendanceRate ?? 0}%`, { x: 60, y: 712, size: 13, font: body });
  let y = 676;
  (data.results ?? []).forEach((r) => {
    page.drawText(`${r.label}: ${r.value}`, { x: 60, y, size: 12, font: body });
    y -= 24;
  });
  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
