import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseRecordDto, UpdateCourseRecordDto } from './dto/course-record.dto';

@Injectable()
export class CourseRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, courseId?: string) {
    return this.prisma.client.courseRecord.findMany({
      where: { tenantId, ...(courseId ? { courseId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(tenantId: string, dto: CreateCourseRecordDto) {
    return this.prisma.client.courseRecord.create({
      data: {
        courseId: dto.courseId,
        type: dto.type ?? 'TEACHING_LOG',
        recordDate: dto.recordDate,
        topic: dto.topic,
        trainer: dto.trainer,
        hours: dto.hours,
        notes: dto.notes,
        tenantId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateCourseRecordDto) {
    await this.prisma.client.courseRecord.updateMany({
      where: { id, tenantId },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.recordDate !== undefined ? { recordDate: dto.recordDate } : {}),
        ...(dto.topic !== undefined ? { topic: dto.topic } : {}),
        ...(dto.trainer !== undefined ? { trainer: dto.trainer } : {}),
        ...(dto.hours !== undefined ? { hours: dto.hours } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
      },
    });
    return this.prisma.client.courseRecord.findFirst({ where: { id, tenantId } });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.client.courseRecord.deleteMany({ where: { id, tenantId } });
    return { ok: true };
  }
}