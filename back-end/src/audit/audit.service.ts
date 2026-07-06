import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly log: AuditLogService,
  ) {}

  // Simple readiness signal: share of participant files that are complete.
  async readiness(tenantId: string) {
    const total = await this.prisma.client.participant.count({ where: { tenantId } });
    const complete = await this.prisma.client.participant.count({ where: { tenantId, fileCompleteness: 100 } });
    const readiness = total ? Math.round((complete / total) * 100) : 0;
    return { total, complete, readiness };
  }

  // Draw a random sample of participant files (the "pull me five files" workflow).
  async drawSample(tenantId: string, n: number, userId?: string) {
    const participants = await this.prisma.client.participant.findMany({
      where: { tenantId },
      select: { id: true, name: true, measureId: true, fileCompleteness: true },
    });
    const shuffled = [...participants].sort(() => Math.random() - 0.5).slice(0, n);
    const record = await this.prisma.client.auditRecord.create({
      data: { tenantId, sample: shuffled, note: `Sample of ${shuffled.length}` },
    });
    await this.log.record(tenantId, 'draw_sample', { entity: 'AuditRecord', entityId: record.id, userId, data: { n } });
    return record;
  }

  history(tenantId: string) {
    return this.prisma.client.auditRecord.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  logs(tenantId: string) {
    return this.log.list(tenantId);
  }

  // ===== External audits (CertQua etc.) =====
  listExternal(tenantId: string) {
    return this.prisma.client.externalAudit.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
    });
  }

  addExternal(
    tenantId: string,
    dto: { date?: string; body?: string; type?: string; findings?: string; status?: string },
  ) {
    return this.prisma.client.externalAudit.create({
      data: {
        tenantId,
        date: dto.date,
        body: dto.body,
        type: dto.type,
        findings: dto.findings,
        status: dto.status ?? 'open',
      },
    });
  }

  async removeExternal(tenantId: string, id: string) {
    const row = await this.prisma.client.externalAudit.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('External audit not found');
    return this.prisma.client.externalAudit.delete({ where: { id } });
  }
}