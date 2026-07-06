import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCapaDto } from './dto/create-capa.dto';
import { UpdateCapaDto } from './dto/update-capa.dto';

@Injectable()
export class CapaService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateCapaDto) {
    return this.prisma.client.capa.create({ data: { ...dto, tenantId } });
  }

  findAll(tenantId: string) {
    return this.prisma.client.capa.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.capa.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Capa not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateCapaDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.capa.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.capa.delete({ where: { id } });
  }
}
