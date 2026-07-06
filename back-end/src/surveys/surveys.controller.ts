import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, UpdateSurveyDto } from './dto/survey.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly service: SurveysService) {}

  @Get()
  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)
  findAll(@CurrentTenant() tenantId: string, @Query('participantId') participantId?: string) {
    return this.service.findAll(tenantId, participantId);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateSurveyDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateSurveyDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}