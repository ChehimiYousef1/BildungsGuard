import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateCertificate(data: {
  participant: string; measure: string; provider: string; date: string;
  tid?: string;
}): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 landscape
  const W = 842, H = 595;

  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const body = await pdf.embedFont(StandardFonts.Helvetica);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const blue = rgb(0.07, 0.29, 0.55);   // أزرق الشهادة
  const ink = rgb(0.10, 0.10, 0.12);
  const muted = rgb(0.42, 0.44, 0.50);

  // خلفية بيضاء + إطار رمادي رفيع
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 18, y: 18, width: W - 36, height: H - 36, borderColor: rgb(0.85, 0.86, 0.9), borderWidth: 1.5 });

  const MX = 70; // هامش يسار

  // العنوان CERTIFICATE
  page.drawText('CERTIFICATE', { x: MX, y: H - 110, size: 46, font: bold, color: blue });

  // شارة المؤسسة (يمين فوق)
  const badgeX = W - 230, badgeY = H - 160, badgeW = 160, badgeH = 90;
  page.drawRectangle({ x: badgeX, y: badgeY, width: badgeW, height: badgeH, color: blue });
  // ذيل الشارة (مثلث صغير)
  page.drawRectangle({ x: badgeX + 10, y: badgeY - 14, width: badgeW - 20, height: 16, color: rgb(0.05, 0.22, 0.42) });
  const prov = (data.provider || 'CERTIFIED').toUpperCase();
  const provSize = prov.length > 16 ? 11 : 15;
  const provW = bold.widthOfTextAtSize(prov, provSize);
  page.drawText(prov, { x: badgeX + (badgeW - provW) / 2, y: badgeY + 52, size: provSize, font: bold, color: rgb(1, 1, 1) });
  const cTxt = 'CERTIFIED';
  const cW = body.widthOfTextAtSize(cTxt, 11);
  page.drawText(cTxt, { x: badgeX + (badgeW - cW) / 2, y: badgeY + 28, size: 11, font: body, color: rgb(0.8, 0.85, 0.95) });

  // This is to certify that
  page.drawText('This is to certify that', { x: MX, y: H - 175, size: 14, font: body, color: muted });

  // اسم المشارك (كبير)
  page.drawText(data.participant, { x: MX, y: H - 225, size: 36, font: body, color: ink });

  // has successfully completed...
  page.drawText('has successfully completed requirements to be recognized as', { x: MX, y: H - 270, size: 13, font: body, color: muted });

  // المقياس (كبير)
  page.drawText(data.measure, { x: MX, y: H - 320, size: 32, font: body, color: ink });

  // نص وصفي
  page.drawText(`The assessment process was offered by ${data.provider}.`, { x: MX, y: H - 360, size: 12.5, font: body, color: muted });
  page.drawText('Candidate has been found proficient in the', { x: MX, y: H - 382, size: 12.5, font: body, color: muted });
  page.drawText('required modules of the measure.', { x: MX, y: H - 404, size: 12.5, font: body, color: muted });

  // التوقيع (يمين)
  page.drawText('. . . . . . . . . . . . . . . . . . . .', { x: W - 280, y: 200, size: 16, font: italic, color: ink });
  page.drawLine({ start: { x: W - 285, y: 185 }, end: { x: W - 95, y: 185 }, thickness: 0.8, color: muted });
  page.drawText('Exam Head', { x: W - 215, y: 165, size: 11, font: body, color: muted });

  // TID
  page.drawText('TID -', { x: MX, y: 130, size: 13, font: body, color: muted });
  page.drawText(data.tid || '—', { x: MX + 42, y: 130, size: 13, font: bold, color: ink });

  // Achievement Date
  page.drawText('Achievement Date :', { x: MX, y: 100, size: 13, font: body, color: muted });
  page.drawText(data.date, { x: MX + 135, y: 100, size: 13, font: bold, color: ink });

  // تذييل
  const foot = 'All in One · AZAV · LMS & QM';
  const footW = body.widthOfTextAtSize(foot, 8);
  page.drawText(foot, { x: (W - footW) / 2, y: 40, size: 8, font: body, color: muted });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}