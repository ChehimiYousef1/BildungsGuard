import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LessonProgressService } from './lesson-progress.service';
import { ToggleLessonProgressDto } from './dto/lesson-progress.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('lesson-progress')
export class LessonProgressController {
  constructor(private readonly service: LessonProgressService) {}

  @Get()
  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)
  findAll(@CurrentTenant() tenantId: string, @Query('participantId') participantId?: string) {
    return this.service.findAll(tenantId, participantId);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)
  toggle(@CurrentTenant() tenantId: string, @Body() dto: ToggleLessonProgressDto) {
    return this.service.toggle(tenantId, dto);
  }
}