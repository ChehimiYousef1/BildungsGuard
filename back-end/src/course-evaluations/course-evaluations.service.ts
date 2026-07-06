import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseEvaluationDto, UpdateCourseEvaluationDto } from './dto/course-evaluation.dto';

@Injectable()
export class CourseEvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateCourseEvaluationDto) {
    return this.prisma.client.courseEvaluation.create({
      data: { ...dto, tenantId },
      include: { course: true, measure: true },
    });
  }

  findAll(tenantId: string, courseId?: string, measureId?: string) {
    return this.prisma.client.courseEvaluation.findMany({
      where: {
        tenantId,
        ...(courseId ? { courseId } : {}),
        ...(measureId ? { measureId } : {}),
      },
      include: { course: true, measure: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.courseEvaluation.findFirst({
      where: { id, tenantId },
      include: { course: true, measure: true },
    });
    if (!row) throw new NotFoundException('CourseEvaluation not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateCourseEvaluationDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.courseEvaluation.update({
      where: { id },
      data: dto,
      include: { course: true, measure: true },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.courseEvaluation.delete({ where: { id } });
  }

  async summary(tenantId: string, measureId?: string) {
    const rows = await this.prisma.client.courseEvaluation.findMany({
      where: { tenantId, ...(measureId ? { measureId } : {}) },
    });
    if (rows.length === 0) return { count: 0, avgOverall: null, avgContent: null, avgTrainer: null };
    const avg = (field: 'overallRating' | 'contentRating' | 'trainerRating') => {
      const vals = rows.map((r) => r[field]).filter((v): v is number => v !== null);
      return vals.length
        ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
        : null;
    };
    return {
      count: rows.length,
      avgOverall: avg('overallRating'),
      avgContent: avg('contentRating'),
      avgTrainer: avg('trainerRating'),
      totalParticipants: rows.reduce((s, r) => s + (r.participantCount ?? 0), 0),
    };
  }
}