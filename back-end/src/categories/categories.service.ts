import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    const rows = await this.prisma.client.category.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    if (rows.length === 0) {
      // بذور افتراضية أول مرّة
      const seed = [
        { groupId: 'meas', name: 'Umschulung' },
        { groupId: 'meas', name: 'Weiterbildung' },
        { groupId: 'doc', name: 'Vertrag' },
        { groupId: 'doc', name: 'Zertifikat' },
        { groupId: 'capa', name: 'Organisation' },
        { groupId: 'capa', name: 'Qualität' },
        { groupId: 'seg', name: 'Aktive Teilnehmer' },
        { groupId: 'seg', name: 'Absolventen' },
      ];
      await this.prisma.client.category.createMany({ data: seed.map((s) => ({ ...s, tenantId })) });
      return this.prisma.client.category.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    }
    return rows;
  }

  create(tenantId: string, dto: any) {
    return this.prisma.client.category.create({
      data: { groupId: dto.groupId, name: dto.name, tenantId },
    });
  }

  async remove(tenantId: string, id: string) {
    const row = await this.prisma.client.category.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Category not found');
    await this.prisma.client.category.delete({ where: { id } });
    return { ok: true };
  }
}