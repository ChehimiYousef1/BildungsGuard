import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

const PASS_MARK = 50;

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, measureId?: string) {
    return this.prisma.client.quiz.findMany({
      where: { tenantId, ...(measureId ? { measureId } : {}) },
      include: {
        questions: true,
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.client.quiz.findFirst({
      where: { id, tenantId },
      include: { questions: true },
    });
  }

  async create(tenantId: string, dto: any) {
    const { questions, ...quizData } = dto;
    return this.prisma.client.quiz.create({
      data: {
        ...quizData,
        tenantId,
        questions: questions?.length
          ? { create: questions.map((q: any) => ({ ...q, tenantId })) }
          : undefined,
      },
      include: { questions: true },
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    return this.prisma.client.quiz.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.client.quiz.delete({ where: { id } });
  }

  async importFromExcel(tenantId: string, id: string, file: Express.Multer.File) {
    const wb = XLSX.read(file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws);
    if (!rows.length) throw new BadRequestException('Excel file is empty');

    const questions = rows
      .map(r => ({
        quizId:        id,
        question:      String(r['Question'] || '').trim(),
        optionA:       String(r['OptionA'] || r['Option A'] || '').trim(),
        optionB:       String(r['OptionB'] || r['Option B'] || '').trim(),
        optionC:       String(r['OptionC'] || r['Option C'] || '').trim(),
        optionD:       String(r['OptionD'] || r['Option D'] || '').trim() || null,
        correctAnswer: String(r['CorrectAnswer'] || r['Correct Answer'] || 'A').trim().toUpperCase(),
        points:        Number(r['Points'] || 1),
        topic:         String(r['Topic'] || '').trim() || null,
        tenantId,
      }))
      .filter(q => q.question && q.optionA && q.optionB);

    if (!questions.length) throw new BadRequestException('No valid questions found');
    await this.prisma.client.question.createMany({ data: questions });
    return { imported: questions.length };
  }

  async submitAttempt(
    tenantId: string,
    quizId: string,
    participantId: string,
    answers: Record<string, string>,
  ) {
    const quiz = await this.prisma.client.quiz.findFirst({
      where: { id: quizId, tenantId },
      include: { questions: true },
    });
    if (!quiz) throw new BadRequestException('Quiz not found');

    let score = 0, total = 0;
    quiz.questions.forEach(q => {
      total += q.points;
      if (answers[q.id] === q.correctAnswer) score += q.points;
    });

    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const passed = pct >= (quiz.passMark ?? PASS_MARK);

    console.log('[Quiz Submit] score:', score, '/', total, '| passed:', passed, '| pid:', participantId);
    let attempt;
    try {
      attempt = await this.prisma.client.quizAttempt.create({
        data: { quizId, participantId, score, total, passed, answers: answers as any, tenantId },
      });
      console.log('[Quiz] attempt saved');
    } catch(e: any) { console.error('[Quiz] attempt FAILED:', e.message); throw e; }
    try {
      await this.prisma.client.survey.create({
        data: { participantId, type: 'test', title: quiz.title, score: `${score}/${total}`, rating: Math.round(pct / 20), maxRating: 5, surveyDate: new Date().toLocaleDateString('de-DE'), tenantId },
      });
      console.log('[Quiz] survey saved');
    // Auto-create alumni if passed
    if (passed) {
      try {
        const participant = await this.prisma.client.participant.findFirst({
          where: { id: participantId, tenantId },
        });
        // Fetch measure separately
        const measure = participant?.measureId
          ? await this.prisma.client.measure.findFirst({ where: { id: participant.measureId } })
          : null;
        console.log('[Alumni] participant found:', participant?.name, '| measureId:', (participant as any)?.measureId);
        if (participant) {
          // Update participant status to completed
          await this.prisma.client.participant.update({
            where: { id: participantId },
            data: { status: 'completed' },
          });
          // Create alumni record
          const measureName = (measure as any)?.name ?? '';
          console.log('[Alumni] measureName:', measureName);
          const existing = await this.prisma.client.alumni.findFirst({
            where: { tenantId, name: participant.name, measure: measureName },
          });
          if (!existing) {
            await this.prisma.client.alumni.create({
              data: {
                name: participant.name,
                measure: measureName,
                outcome: 'employed',
                graduatedAt: new Date().toLocaleDateString('de-DE'),
                tenantId,
              },
            });
            console.log('[Quiz] auto-alumni created for:', participant.name);
          }
        }
      } catch(e: any) { console.error('[Quiz] auto-alumni FAILED:', e.message, e.stack); }
    }
    } catch(e: any) { console.error('[Quiz] survey FAILED:', e.message); }

    return { ...attempt, pct, passed };
  }

  async getStats(tenantId: string, measureId?: string) {
    const quizWhere: any = { tenantId };
    if (measureId) quizWhere.measureId = measureId;

    const [totalQuizzes, attempts] = await Promise.all([
      this.prisma.client.quiz.count({ where: quizWhere }),
      this.prisma.client.quizAttempt.findMany({
        where: {
          tenantId,
          ...(measureId ? { quiz: { measureId } } : {}),
        },
        select: { passed: true },
      }),
    ]);

    const totalAttempts = attempts.length;
    const passCount    = attempts.filter(a => a.passed).length;
    const passRate     = totalAttempts > 0 ? Math.round((passCount / totalAttempts) * 100) : 0;
    return { totalQuizzes, totalAttempts, passCount, passRate };
  }

  async getAttempts(tenantId: string, quizId: string, user?: any) {
    return this.prisma.client.quizAttempt.findMany({
      where: { quizId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resetAttempt(tenantId: string, quizId: string, participantId: string) {
    await this.prisma.client.quizAttempt.deleteMany({
      where: { quizId, participantId, tenantId },
    });
    return { reset: true };
  }

  getTemplate() {
    const rows = [
      { Question: 'What is 2+2?', OptionA: '3', OptionB: '4', OptionC: '5', OptionD: '6', CorrectAnswer: 'B', Points: 1, Topic: 'Math' },
      { Question: 'Capital of Germany?', OptionA: 'Munich', OptionB: 'Berlin', OptionC: 'Hamburg', OptionD: 'Cologne', CorrectAnswer: 'B', Points: 1, Topic: 'Geography' },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }
}