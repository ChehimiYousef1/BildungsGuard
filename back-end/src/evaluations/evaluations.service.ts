import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, participantId?: string, courseId?: string) {
    return this.prisma.client.evaluation.findMany({
      where: {
        tenantId,
        ...(participantId ? { participantId } : {}),
        ...(courseId ? { courseId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(tenantId: string, dto: CreateEvaluationDto) {
    return this.prisma.client.evaluation.create({
      data: {
        scope: dto.scope ?? 'participant',
        participantId: dto.participantId,
        courseId: dto.courseId,
        title: dto.title,
        rating: dto.rating,
        strengths: dto.strengths,
        weaknesses: dto.weaknesses,
        recommendation: dto.recommendation,
        evalDate: dto.evalDate,
        author: dto.author,
        tenantId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateEvaluationDto) {
    await this.prisma.client.evaluation.updateMany({
      where: { id, tenantId },
      data: {
        ...(dto.scope !== undefined ? { scope: dto.scope } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.strengths !== undefined ? { strengths: dto.strengths } : {}),
        ...(dto.weaknesses !== undefined ? { weaknesses: dto.weaknesses } : {}),
        ...(dto.recommendation !== undefined ? { recommendation: dto.recommendation } : {}),
        ...(dto.evalDate !== undefined ? { evalDate: dto.evalDate } : {}),
        ...(dto.author !== undefined ? { author: dto.author } : {}),
      },
    });
    return this.prisma.client.evaluation.findFirst({ where: { id, tenantId } });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.client.evaluation.deleteMany({ where: { id, tenantId } });
    return { ok: true };
  }
}