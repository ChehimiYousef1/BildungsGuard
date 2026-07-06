import { Module } from '@nestjs/common';
import { ParticipantRecordsService } from './participant-records.service';
import { ParticipantRecordsController } from './participant-records.controller';

@Module({
  controllers: [ParticipantRecordsController],
  providers: [ParticipantRecordsService],
  exports: [ParticipantRecordsService],
})
export class ParticipantRecordsModule {}