import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ToggleLessonProgressDto } from './dto/lesson-progress.dto';

@Injectable()
export class LessonProgressService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, participantId?: string) {
    return this.prisma.client.lessonProgress.findMany({
      where: { tenantId, ...(participantId ? { participantId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  // يبدّل حالة الإكمال (upsert): يخلق أو يحدّث صفّ المتدرّب+الجلسة
  async toggle(tenantId: string, dto: ToggleLessonProgressDto) {
    const completed = dto.completed ?? true;
    const existing = await this.prisma.client.lessonProgress.findFirst({
      where: { participantId: dto.participantId, sessionId: dto.sessionId, tenantId },
    });
    if (existing) {
      return this.prisma.client.lessonProgress.update({
        where: { id: existing.id },
        data: { completed, completedAt: completed ? new Date().toISOString() : null },
      });
    }
    return this.prisma.client.lessonProgress.create({
      data: {
        participantId: dto.participantId,
        sessionId: dto.sessionId,
        courseId: dto.courseId,
        completed,
        completedAt: completed ? new Date().toISOString() : null,
        tenantId,
      },
    });
  }
}