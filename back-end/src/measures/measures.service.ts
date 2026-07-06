import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeasuresDto } from './dto/create-measures.dto';
import { UpdateMeasuresDto } from './dto/update-measures.dto';

@Injectable()
export class MeasuresService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateMeasuresDto) {
    return this.prisma.client.measure.create({ data: { ...dto, tenantId } });
  }

  findAll(tenantId: string) {
    return this.prisma.client.measure.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.measure.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Measures not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateMeasuresDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.measure.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.measure.delete({ where: { id } });
  }

  // ===== Curriculum modules =====
  async listModules(tenantId: string, measureId: string) {
    await this.findOne(tenantId, measureId);
    return this.prisma.client.measureModule.findMany({
      where: { tenantId, measureId },
      orderBy: { order: 'asc' },
    });
  }

  async addModule(
    tenantId: string,
    measureId: string,
    dto: { title: string; ueHours?: number; status?: string; order?: number },
  ) {
    await this.findOne(tenantId, measureId);
    return this.prisma.client.measureModule.create({
      data: {
        tenantId,
        measureId,
        title: dto.title,
        ueHours: Number(dto.ueHours) || 0,
        status: dto.status ?? 'planned',
        order: Number(dto.order) || 0,
      },
    });
  }

  async removeModule(tenantId: string, measureId: string, moduleId: string) {
    await this.findOne(tenantId, measureId);
    const row = await this.prisma.client.measureModule.findFirst({
      where: { id: moduleId, tenantId, measureId },
    });
    if (!row) throw new NotFoundException('Module not found');
    return this.prisma.client.measureModule.delete({ where: { id: moduleId } });
  }

  // ===== Change history =====
  async listChanges(tenantId: string, measureId: string) {
    await this.findOne(tenantId, measureId);
    return this.prisma.client.measureChange.findMany({
      where: { tenantId, measureId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addChange(
    tenantId: string,
    measureId: string,
    dto: { date?: string; reason: string; responsible?: string },
  ) {
    await this.findOne(tenantId, measureId);
    return this.prisma.client.measureChange.create({
      data: {
        tenantId,
        measureId,
        date: dto.date,
        reason: dto.reason,
        responsible: dto.responsible,
      },
    });
  }

  async removeChange(tenantId: string, measureId: string, changeId: string) {
    await this.findOne(tenantId, measureId);
    const row = await this.prisma.client.measureChange.findFirst({
      where: { id: changeId, tenantId, measureId },
    });
    if (!row) throw new NotFoundException('Change not found');
    return this.prisma.client.measureChange.delete({ where: { id: changeId } });
  }
}