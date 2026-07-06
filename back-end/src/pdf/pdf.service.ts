import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateCertificate } from './generators/certificate.generator';
import { generateErgebnisbogen } from './generators/ergebnisbogen.generator';
import { generateBundle } from './generators/bundle.generator';

@Injectable()
export class PdfService {
  constructor(private readonly prisma: PrismaService) {}

  private async measureName(tenantId: string, measureId?: string | null) {
    if (!measureId) return '—';
    const m = await this.prisma.client.measure.findFirst({ where: { id: measureId, tenantId } });
    return m?.name ?? '—';
  }

  async certificate(tenantId: string, participantId: string): Promise<Buffer> {
    const p = await this.prisma.client.participant.findFirst({ where: { id: participantId, tenantId } });
    if (!p) throw new NotFoundException('Participant not found');
    const tenant = await this.prisma.client.tenant.findUnique({ where: { id: tenantId } });
    return generateCertificate({
      participant: p.name,
      measure: await this.measureName(tenantId, p.measureId),
      provider: tenant?.name ?? 'All in One',
      date: new Date().toLocaleDateString('de-DE'),
      tid: p.id.slice(-8).toUpperCase(),
    });
  }

  async ergebnisbogen(tenantId: string, participantId: string): Promise<Buffer> {
    const p = await this.prisma.client.participant.findFirst({ where: { id: participantId, tenantId } });
    if (!p) throw new NotFoundException('Participant not found');
    const attendance = await this.prisma.client.attendance.findMany({ where: { participantId, tenantId } });
    const present = attendance.filter((a: any) => a.present).length;
    const rate = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
    return generateErgebnisbogen({
      participant: p.name,
      measure: await this.measureName(tenantId, p.measureId),
      attendanceRate: rate,
      results: [{ label: 'Aktenstand', value: `${p.fileCompleteness}%` }],
    });
  }

  // ===== Bundle exports =====
  private async tenantName(tenantId: string) {
    const t = await this.prisma.client.tenant.findUnique({ where: { id: tenantId } });
    return t?.name ?? 'All in One';
  }

  // 1) تقرير المشاركين الكامل
  async participantBundle(tenantId: string): Promise<Buffer> {
    const parts = await this.prisma.client.participant.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    const sections = [{
      heading: `Teilnehmer (${parts.length})`,
      rows: parts.map((p: any) => ({
        label: p.name,
        value: `${p.status} · Akte ${p.fileCompleteness}% · ${p.fundingType ?? '—'}`,
      })),
    }];
    return generateBundle({
      title: 'Teilnehmerakte — Übersicht',
      provider: await this.tenantName(tenantId),
      date: new Date().toLocaleDateString('de-DE'),
      sections: sections.length && sections[0].rows.length ? sections : [{ heading: 'Teilnehmer', rows: [{ label: 'Keine Daten', value: '—' }] }],
    });
  }

  // 2) تقرير المقاييس الكامل
  async measureBundle(tenantId: string): Promise<Buffer> {
    const measures = await this.prisma.client.measure.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    const sections = await Promise.all(measures.map(async (m: any) => {
      const modules = await this.prisma.client.measureModule.findMany({ where: { tenantId, measureId: m.id }, orderBy: { order: 'asc' } });
      const ueTotal = modules.reduce((s: number, x: any) => s + (x.ueHours || 0), 0);
      return {
        heading: m.name,
        rows: [
          { label: 'Nummer', value: m.number ?? '—' },
          { label: 'AZAV', value: m.azav ?? '—' },
          { label: 'Status', value: m.status ?? '—' },
          { label: 'UE gesamt', value: `${ueTotal}` },
          { label: 'Belegung', value: `${m.enrolled}/${m.capacity}` },
          ...modules.map((x: any) => ({ label: `Modul: ${x.title}`, value: `${x.ueHours} UE` })),
        ],
      };
    }));
    return generateBundle({
      title: 'Maßnahmenakte — Übersicht',
      provider: await this.tenantName(tenantId),
      date: new Date().toLocaleDateString('de-DE'),
      sections: sections.length ? sections : [{ heading: 'Maßnahmen', rows: [{ label: 'Keine Daten', value: '—' }] }],
    });
  }

  // 3) تقرير تسوية التمويل (حضور)
  async fundingBundle(tenantId: string): Promise<Buffer> {
    const parts = await this.prisma.client.participant.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
    const rows = await Promise.all(parts.map(async (p: any) => {
      const att = await this.prisma.client.attendance.findMany({ where: { participantId: p.id, tenantId } });
      const present = att.filter((a: any) => a.present).length;
      const rate = att.length ? Math.round((present / att.length) * 100) : 0;
      return { label: p.name, value: `Anwesenheit ${rate}% · ${p.fundingType ?? '—'} · ${p.voucher ?? '—'}` };
    }));
    return generateBundle({
      title: 'Abrechnung & Verbleib',
      provider: await this.tenantName(tenantId),
      date: new Date().toLocaleDateString('de-DE'),
      sections: [{ heading: `Abrechnung (${parts.length} Teilnehmer)`, rows: rows.length ? rows : [{ label: 'Keine Daten', value: '—' }] }],
    });
  }
}