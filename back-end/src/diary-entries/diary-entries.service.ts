import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiaryEntryDto, UpdateDiaryEntryDto } from './dto/diary-entry.dto';

@Injectable()
export class DiaryEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, participantId?: string) {
    return this.prisma.client.diaryEntry.findMany({
      where: { tenantId, ...(participantId ? { participantId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(tenantId: string, dto: CreateDiaryEntryDto) {
    return this.prisma.client.diaryEntry.create({
      data: {
        participantId: dto.participantId,
        entryDate: dto.entryDate,
        company: dto.company,
        position: dto.position,
        method: dto.method,
        status: dto.status ?? 'applied',
        notes: dto.notes,
        tenantId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateDiaryEntryDto) {
    await this.prisma.client.diaryEntry.updateMany({
      where: { id, tenantId },
      data: {
        ...(dto.entryDate !== undefined ? { entryDate: dto.entryDate } : {}),
        ...(dto.company !== undefined ? { company: dto.company } : {}),
        ...(dto.position !== undefined ? { position: dto.position } : {}),
        ...(dto.method !== undefined ? { method: dto.method } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
    return this.prisma.client.diaryEntry.findFirst({ where: { id, tenantId } });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.client.diaryEntry.deleteMany({ where: { id, tenantId } });
    return { ok: true };
  }
}