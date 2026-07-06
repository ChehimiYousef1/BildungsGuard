import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipantsDto } from './dto/create-participants.dto';
import { UpdateParticipantsDto } from './dto/update-participants.dto';

@Injectable()
export class ParticipantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateParticipantsDto) {
    const { email, password, ...rest } = dto;

    const participant = await this.prisma.client.participant.create({
      data: {
        ...rest,
        contact: email ?? rest.contact,
        tenantId,
      },
    });

    // لو الأدمِن أدخل email + password → أنشئ حساب دخول للمتدرّب
    if (email && password) {
      await this.prisma.runAsTenant(tenantId, async (tx) => {
        await tx.user.create({
          data: {
            email,
            password: await bcrypt.hash(password, 10),
            role: 'participant',
            name: rest.name,
            tenantId,
          },
        });
      });
    }

    return participant;
  }

  findAll(tenantId: string) {
    return this.prisma.client.participant.findMany({
      where: { tenantId },
      include: { measure: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.participant.findFirst({
      where: { id, tenantId },
      include: { measure: true },
    });
    if (!row) throw new NotFoundException('Participant not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateParticipantsDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.participant.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.participant.delete({ where: { id } });
  }
}