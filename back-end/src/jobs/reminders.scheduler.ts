import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  // 1) تذكير تسجيل الدخول — كل يوم 9 صباحًا
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async loginReminders() {
    this.logger.log('Running daily login reminders');
    try {
      const participants = await this.prisma.client.participant.findMany({
        where: { status: 'enrolled' },
      });
      let sent = 0;
      for (const p of participants) {
        if (!p.contact || !p.contact.includes('@')) continue;
        await this.mail.send(
          p.contact,
          'Erinnerung: Bitte loggen Sie sich ein',
          `<p>Hallo ${p.name},</p><p>bitte denken Sie daran, sich regelmäßig in Ihrem Kurs einzuloggen.</p><p>Ihr Bildungsträger</p>`,
        );
        sent++;
      }
      this.logger.log(`Login reminders sent: ${sent}`);
    } catch (e) {
      this.logger.error('loginReminders failed', e as any);
    }
  }

  // 2) تذكير يوميات العمل — أول كل شهر 8 صباحًا
  @Cron('0 8 1 * *')
  async jobDiaryReminders() {
    this.logger.log('Running monthly job-diary reminders');
    try {
      const participants = await this.prisma.client.participant.findMany({
        where: { status: 'enrolled' },
      });
      let sent = 0;
      for (const p of participants) {
        if (!p.contact || !p.contact.includes('@')) continue;
        await this.mail.send(
          p.contact,
          'Monatliches Berichtsheft fällig',
          `<p>Hallo ${p.name},</p><p>bitte reichen Sie Ihr monatliches Berichtsheft (Job-Diary) ein.</p>`,
        );
        sent++;
      }
      this.logger.log(`Job-diary reminders sent: ${sent}`);
    } catch (e) {
      this.logger.error('jobDiaryReminders failed', e as any);
    }
  }

  // 3) استبيان الخرّيجين بعد 6 أشهر — كل يوم 10 صباحًا (يفحص من تخرّج)
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async alumniSurvey() {
    this.logger.log('Running alumni outcome survey check');
    try {
      const alumni = await this.prisma.client.alumni.findMany({
        where: { followUp6: false, consent: true },
      });
      let sent = 0;
      for (const a of alumni) {
        // ما عندنا حقل بريد للخرّيج — نسجّل فقط (يُربط ببريد لاحقًا عند توفّره)
        this.logger.log(`Alumni survey due for: ${a.name}`);
        sent++;
      }
      this.logger.log(`Alumni surveys due: ${sent}`);
    } catch (e) {
      this.logger.error('alumniSurvey failed', e as any);
    }
  }
}