import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipantRecordDto, UpdateParticipantRecordDto } from './dto/participant-record.dto';

@Injectable()
export class ParticipantRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  // كل السجلّات (اختياريًّا حسب المتدرّب)
  findAll(tenantId: string, participantId?: string) {
    return this.prisma.client.participantRecord.findMany({
      where: { tenantId, ...(participantId ? { participantId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(tenantId: string, dto: CreateParticipantRecordDto) {
    return this.prisma.client.participantRecord.create({
      data: {
        participantId: dto.participantId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        recordDate: dto.recordDate,
        author: dto.author,
        signed: dto.signed ?? false,
        tenantId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateParticipantRecordDto) {
    await this.prisma.client.participantRecord.updateMany({
      where: { id, tenantId },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.recordDate !== undefined ? { recordDate: dto.recordDate } : {}),
        ...(dto.author !== undefined ? { author: dto.author } : {}),
        ...(dto.signed !== undefined ? { signed: dto.signed } : {}),
      },
    });
    return this.prisma.client.participantRecord.findFirst({ where: { id, tenantId } });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.client.participantRecord.deleteMany({ where: { id, tenantId } });
    return { ok: true };
  }
}