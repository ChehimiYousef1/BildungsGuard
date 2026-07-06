import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_REMINDERS, JOB_LOGIN_REMINDER } from '../queues';

@Processor(QUEUE_REMINDERS)
export class LoginReminderProcessor {
  private readonly logger = new Logger(LoginReminderProcessor.name);

  @Process(JOB_LOGIN_REMINDER)
  async handle(job: Job) {
    this.logger.log(`Sending login reminders (tenant ${job.data?.tenantId ?? 'all'})`);
    // TODO: query participants without recent login and send via MailService.
  }
}
