import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto, UpdateEvaluationDto } from './dto/evaluation.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly service: EvaluationsService) {}

  @Get()
  @Roles(AppRole.Admin, AppRole.Trainer)
  findAll(@CurrentTenant() tenantId: string, @Query('participantId') participantId?: string, @Query('courseId') courseId?: string) {
    return this.service.findAll(tenantId, participantId, courseId);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateEvaluationDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateEvaluationDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}