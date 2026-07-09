import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainersDto } from './dto/create-trainers.dto';
import { UpdateTrainersDto } from './dto/update-trainers.dto';

@Injectable()
export class TrainersService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateTrainersDto) {
    return this.prisma.client.trainer.create({ data: { ...dto, tenantId } });
  }

  async findAll(tenantId: string) {
    const trainers = await this.prisma.client.trainer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(
      trainers.map(async (tr: any) => {
        if (tr.email) return tr;
        try {
          const user = await this.prisma.client.user.findFirst({
            where: { tenantId, name: tr.name, role: 'trainer' },
            select: { email: true },
          });
          return { ...tr, email: user?.email ?? '' };
        } catch { return tr; }
      })
    );

    return enriched;
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.trainer.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Trainers not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateTrainersDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.trainer.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.trainer.delete({ where: { id } });
  }
}