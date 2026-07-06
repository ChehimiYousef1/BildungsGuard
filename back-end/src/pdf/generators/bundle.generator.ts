import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateBundle(data: {
  title: string;
  provider: string;
  date: string;
  sections: { heading: string; rows: { label: string; value: string }[] }[];
}): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  let page = pdf.addPage([595, 842]); // A4 portrait
  const W = 595, H = 842;
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const body = await pdf.embedFont(StandardFonts.Helvetica);

  const iris = rgb(0.31, 0.17, 0.80);
  const ink = rgb(0.10, 0.10, 0.12);
  const muted = rgb(0.42, 0.44, 0.50);

  let y = H - 70;

  // رأس
  page.drawText(data.provider, { x: 50, y, size: 11, font: bold, color: muted });
  y -= 28;
  page.drawText(data.title, { x: 50, y, size: 22, font: bold, color: iris });
  y -= 16;
  page.drawText(`Erstellt am ${data.date}`, { x: 50, y, size: 10, font: body, color: muted });
  y -= 30;
  page.drawLine({ start: { x: 50, y }, end: { x: W - 50, y }, thickness: 1, color: rgb(0.85, 0.86, 0.9) });
  y -= 28;

  for (const sec of data.sections) {
    if (y < 90) { page = pdf.addPage([595, 842]); y = H - 70; }
    page.drawText(sec.heading, { x: 50, y, size: 14, font: bold, color: ink });
    y -= 22;
    for (const row of sec.rows) {
      if (y < 70) { page = pdf.addPage([595, 842]); y = H - 70; }
      page.drawText(row.label, { x: 60, y, size: 10.5, font: body, color: muted });
      page.drawText(row.value, { x: 250, y, size: 10.5, font: bold, color: ink });
      y -= 18;
    }
    y -= 16;
  }

  const foot = 'All in One · AZAV · LMS & QM';
  const footW = body.widthOfTextAtSize(foot, 8);
  page.drawText(foot, { x: (W - footW) / 2, y: 35, size: 8, font: body, color: muted });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}