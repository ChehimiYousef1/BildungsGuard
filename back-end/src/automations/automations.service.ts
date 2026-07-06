import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAutomationsDto } from './dto/create-automations.dto';
import { UpdateAutomationsDto } from './dto/update-automations.dto';

@Injectable()
export class AutomationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateAutomationsDto) {
    return this.prisma.client.automation.create({ data: { ...dto, tenantId } });
  }

  findAll(tenantId: string) {
    return this.prisma.client.automation.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.automation.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Automations not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateAutomationsDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.automation.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.automation.delete({ where: { id } });
  }
}
