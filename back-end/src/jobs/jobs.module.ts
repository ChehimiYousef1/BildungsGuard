import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersScheduler } from './reminders.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [RemindersScheduler],
})
export class JobsModule {}