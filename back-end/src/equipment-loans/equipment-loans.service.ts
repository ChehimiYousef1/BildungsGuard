import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentLoanDto, UpdateEquipmentLoanDto } from './dto/equipment-loan.dto';

@Injectable()
export class EquipmentLoansService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateEquipmentLoanDto) {
    return this.prisma.client.equipmentLoan.create({
      data: { ...dto, tenantId },
      include: { participant: true },
    });
  }

  findAll(tenantId: string, participantId?: string) {
    return this.prisma.client.equipmentLoan.findMany({
      where: { tenantId, ...(participantId ? { participantId } : {}) },
      include: { participant: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.equipmentLoan.findFirst({
      where: { id, tenantId },
      include: { participant: true },
    });
    if (!row) throw new NotFoundException('EquipmentLoan not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateEquipmentLoanDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.equipmentLoan.update({
      where: { id },
      data: dto,
      include: { participant: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.equipmentLoan.delete({ where: { id } });
  }

  // إحصاءات — كم جهاز لم يُعَد
  async stats(tenantId: string) {
    const all = await this.prisma.client.equipmentLoan.findMany({ where: { tenantId } });
    return {
      total: all.length,
      active: all.filter((r) => !r.returned).length,
      returned: all.filter((r) => r.returned).length,
      overdue: all.filter((r) => {
        if (r.returned || !r.returnDate) return false;
        const [d, m, y] = r.returnDate.split('.').map(Number);
        return new Date(y, m - 1, d).getTime() < Date.now();
      }).length,
    };
  }
}