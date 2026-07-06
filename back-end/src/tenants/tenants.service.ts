import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTenantDto) {
    return this.prisma.client.tenant.create({ data: dto });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.client.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  update(id: string, dto: UpdateTenantDto) {
    return this.prisma.client.tenant.update({ where: { id }, data: dto });
  }
}
