import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_REMINDERS, JOB_JOB_DIARY } from '../queues';

@Processor(QUEUE_REMINDERS)
export class JobDiaryProcessor {
  private readonly logger = new Logger(JobDiaryProcessor.name);

  @Process(JOB_JOB_DIARY)
  async handle(_job: Job) {
    this.logger.log('Sending monthly job-diary reminders');
  }
}
