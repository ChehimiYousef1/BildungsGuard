import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlacementFollowUpDto } from './dto/placement-follow-up.dto';
import { UpdatePlacementFollowUpDto } from './dto/placement-follow-up.dto';

@Injectable()
export class PlacementFollowUpService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreatePlacementFollowUpDto) {
    return this.prisma.client.placementFollowUp.create({
      data: { ...dto, tenantId },
      include: { participant: true },
    });
  }

  findAll(tenantId: string, participantId?: string) {
    return this.prisma.client.placementFollowUp.findMany({
      where: { tenantId, ...(participantId ? { participantId } : {}) },
      include: { participant: { select: { id: true, name: true, measure: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.placementFollowUp.findFirst({
      where: { id, tenantId },
      include: { participant: true },
    });
    if (!row) throw new NotFoundException('PlacementFollowUp not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdatePlacementFollowUpDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.placementFollowUp.update({
      where: { id },
      data: dto,
      include: { participant: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.placementFollowUp.delete({ where: { id } });
  }

  // Stats for alumni/QM
  async stats(tenantId: string) {
    const all = await this.prisma.client.placementFollowUp.findMany({
      where: { tenantId },
    });
    const byOutcome = all.reduce((acc: Record<string, number>, p) => {
      const k = p.outcome ?? 'unknown';
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
    const employed = all.filter((p) => p.outcome === 'employed').length;
    const total = all.length;
    return {
      total,
      employed,
      integrationRate: total > 0 ? Math.round((employed / total) * 100) : 0,
      byOutcome,
      pending6Month: all.filter((p) => p.month === 0 &&
        !all.find((q) => q.participantId === p.participantId && q.month === 6)).length,
    };
  }
}