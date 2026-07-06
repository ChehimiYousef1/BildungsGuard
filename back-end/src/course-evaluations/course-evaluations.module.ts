import { Module } from '@nestjs/common';
import { CourseEvaluationsService } from './course-evaluations.service';
import { CourseEvaluationsController } from './course-evaluations.controller';

@Module({
  controllers: [CourseEvaluationsController],
  providers: [CourseEvaluationsService],
  exports: [CourseEvaluationsService],
})
export class CourseEvaluationsModule {}