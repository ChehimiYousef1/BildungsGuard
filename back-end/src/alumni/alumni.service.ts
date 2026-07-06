import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlumniDto } from './dto/create-alumni.dto';
import { UpdateAlumniDto } from './dto/update-alumni.dto';

@Injectable()
export class AlumniService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateAlumniDto) {
    return this.prisma.client.alumni.create({ data: { ...dto, tenantId } });
  }

  findAll(tenantId: string) {
    return this.prisma.client.alumni.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.alumni.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Alumni not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateAlumniDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.alumni.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.alumni.delete({ where: { id } });
  }
}
