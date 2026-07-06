import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainerQualificationDto, UpdateTrainerQualificationDto } from './dto/trainer-qualification.dto';

@Injectable()
export class TrainerQualificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, userId?: string) {
    return this.prisma.client.trainerQualification.findMany({
      where: { tenantId, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(tenantId: string, dto: CreateTrainerQualificationDto) {
    return this.prisma.client.trainerQualification.create({
      data: {
        title: dto.title,
        trainerName: dto.trainerName,
        userId: dto.userId,
        type: dto.type ?? 'qualification',
        validUntil: dto.validUntil,
        approvedFor: dto.approvedFor,
        fileRef: dto.fileRef,
        tenantId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateTrainerQualificationDto) {
    await this.prisma.client.trainerQualification.updateMany({
      where: { id, tenantId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.trainerName !== undefined ? { trainerName: dto.trainerName } : {}),
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.validUntil !== undefined ? { validUntil: dto.validUntil } : {}),
        ...(dto.approvedFor !== undefined ? { approvedFor: dto.approvedFor } : {}),
        ...(dto.fileRef !== undefined ? { fileRef: dto.fileRef } : {}),
      },
    });
    return this.prisma.client.trainerQualification.findFirst({ where: { id, tenantId } });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.client.trainerQualification.deleteMany({ where: { id, tenantId } });
    return { ok: true };
  }
}