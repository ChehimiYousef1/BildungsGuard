import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSurveyDto, UpdateSurveyDto } from './dto/survey.dto';

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, participantId?: string) {
    return this.prisma.client.survey.findMany({
      where: { tenantId, ...(participantId ? { participantId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(tenantId: string, dto: CreateSurveyDto) {
    return this.prisma.client.survey.create({
      data: {
        participantId: dto.participantId,
        type: dto.type ?? 'satisfaction',
        title: dto.title,
        rating: dto.rating,
        maxRating: dto.maxRating ?? 5,
        score: dto.score,
        notes: dto.notes,
        surveyDate: dto.surveyDate,
        tenantId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateSurveyDto) {
    await this.prisma.client.survey.updateMany({
      where: { id, tenantId },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
        ...(dto.maxRating !== undefined ? { maxRating: dto.maxRating } : {}),
        ...(dto.score !== undefined ? { score: dto.score } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        ...(dto.surveyDate !== undefined ? { surveyDate: dto.surveyDate } : {}),
      },
    });
    return this.prisma.client.survey.findFirst({ where: { id, tenantId } });
  }

  async remove(tenantId: string, id: string) {
    await this.prisma.client.survey.deleteMany({ where: { id, tenantId } });
    return { ok: true };
  }
}