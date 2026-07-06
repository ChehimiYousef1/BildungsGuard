import { Module } from '@nestjs/common';
import { CourseRecordsService } from './course-records.service';
import { CourseRecordsController } from './course-records.controller';

@Module({
  controllers: [CourseRecordsController],
  providers: [CourseRecordsService],
  exports: [CourseRecordsService],
})
export class CourseRecordsModule {}