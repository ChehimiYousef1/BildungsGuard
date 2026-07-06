import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_REMINDERS, JOB_ALUMNI_SURVEY } from '../queues';

@Processor(QUEUE_REMINDERS)
export class AlumniSurveyProcessor {
  private readonly logger = new Logger(AlumniSurveyProcessor.name);

  @Process(JOB_ALUMNI_SURVEY)
  async handle(_job: Job) {
    this.logger.log('Sending 6-month alumni outcome surveys');
  }
}
