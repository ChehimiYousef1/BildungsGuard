import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAttendanceDto } from './dto/submit-attendance.dto';

function isoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `KW ${String(weekNo).padStart(2, '0')}`;
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  getForSession(tenantId: string, sessionId: string) {
    return this.prisma.client.attendance.findMany({
      where: { sessionId, tenantId },
      include: {
        participant: { select: { id: true, name: true } },
        session:     { select: { id: true, title: true, time: true, room: true, order: true } },
      },
    });
  }

  getForParticipant(tenantId: string, participantId: string) {
    return this.prisma.client.attendance.findMany({
      where: { participantId, tenantId },
      include: {
        session: {
          select: {
            id: true, title: true, time: true, room: true, order: true,
            course: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getTrend(tenantId: string) {
    const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 86400000);
    const rows = await this.prisma.client.attendance.findMany({
      where: { tenantId, createdAt: { gte: eightWeeksAgo } },
      select: { present: true, createdAt: true },
    });
    const buckets = new Map<string, { present: number; total: number; date: Date }>();
    for (const r of rows) {
      const d = new Date(r.createdAt);
      const key = isoWeekKey(d);
      const b = buckets.get(key) ?? { present: 0, total: 0, date: d };
      b.total += 1;
      if (r.present) b.present += 1;
      if (d < b.date) b.date = d;
      buckets.set(key, b);
    }
    return Array.from(buckets.entries())
      .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
      .map(([w, b]) => ({ w, v: b.total > 0 ? Math.round((b.present / b.total) * 100) : 0 }));
  }

  async submit(tenantId: string, sessionId: string, dto: SubmitAttendanceDto) {
    await this.prisma.withTenant((tx) =>
      Promise.all(
        dto.entries.map((e) =>
          tx.attendance.upsert({
            where: { participantId_sessionId: { participantId: e.participantId, sessionId } },
            create: {
              participantId: e.participantId,
              sessionId,
              present: e.present,
              status: e.status ?? (e.present ? 'present' : 'absent'),
              tenantId,
            },
            update: {
              present: e.present,
              status: e.status ?? (e.present ? 'present' : 'absent'),
            },
          }),
        ),
      ),
    );
    return this.getForSession(tenantId, sessionId);
  }
}