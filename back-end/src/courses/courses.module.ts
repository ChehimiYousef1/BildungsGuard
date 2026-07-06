import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
  controllers: [CoursesController, SessionsController],
  providers: [CoursesService, SessionsService],
  exports: [CoursesService, SessionsService],
})
export class CoursesModule {}
