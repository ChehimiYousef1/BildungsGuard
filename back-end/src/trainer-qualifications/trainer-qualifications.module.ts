import { Module } from '@nestjs/common';
import { TrainerQualificationsService } from './trainer-qualifications.service';
import { TrainerQualificationsController } from './trainer-qualifications.controller';

@Module({
  controllers: [TrainerQualificationsController],
  providers: [TrainerQualificationsService],
  exports: [TrainerQualificationsService],
})
export class TrainerQualificationsModule {}