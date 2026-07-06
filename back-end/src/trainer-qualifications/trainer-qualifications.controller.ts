import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TrainerQualificationsService } from './trainer-qualifications.service';
import { CreateTrainerQualificationDto, UpdateTrainerQualificationDto } from './dto/trainer-qualification.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('trainer-qualifications')
export class TrainerQualificationsController {
  constructor(private readonly service: TrainerQualificationsService) {}

  @Get()
  @Roles(AppRole.Admin, AppRole.Trainer)
  findAll(@CurrentTenant() tenantId: string, @Query('userId') userId?: string) {
    return this.service.findAll(tenantId, userId);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateTrainerQualificationDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTrainerQualificationDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}