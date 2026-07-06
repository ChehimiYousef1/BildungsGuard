import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private strip(user: any) {
    if (!user) return user;
    const { password, ...safe } = user;
    return safe;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.client.user.create({
      data: { ...dto, password, tenantId },
    });
    return this.strip(user);
  }

  async findAll(tenantId: string) {
    const users = await this.prisma.client.user.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
    return users.map((u: any) => this.strip(u));
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.client.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User not found');
    return this.strip(user);
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    await this.findOne(tenantId, id);
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.client.user.update({ where: { id }, data });
    return this.strip(user);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.strip(await this.prisma.client.user.delete({ where: { id } }));
  }
}
