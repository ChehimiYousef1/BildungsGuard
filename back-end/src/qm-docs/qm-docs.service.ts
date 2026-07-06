import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QmDocsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    const rows = await this.prisma.client.qmDoc.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    if (rows.length === 0) {
      // بذور افتراضية أول مرّة (process + form)
      const seed = [
        { type: 'process', title: 'Attendance check', status: 'doc_ready' },
        { type: 'process', title: 'Complaint handling', status: 'doc_ready' },
        { type: 'process', title: 'Trainer qualification', status: 'doc_ready' },
        { type: 'form', title: 'Participation contract', status: 'doc_ready' },
      ];
      await this.prisma.client.qmDoc.createMany({ data: seed.map((s) => ({ ...s, tenantId })) });
      return this.prisma.client.qmDoc.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    }
    return rows;
  }

  create(tenantId: string, dto: any) {
    return this.prisma.client.qmDoc.create({
      data: {
        type: dto.type ?? 'process',
        title: dto.title,
        content: dto.content,
        version: dto.version,
        author: dto.author,
        owner: dto.owner,
        status: dto.status ?? 'doc_ready',
        tenantId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    const row = await this.prisma.client.qmDoc.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('QM doc not found');
    return this.prisma.client.qmDoc.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    const row = await this.prisma.client.qmDoc.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('QM doc not found');
    await this.prisma.client.qmDoc.delete({ where: { id } });
    return { ok: true };
  }
}