import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { DiaryEntriesService } from './diary-entries.service';
import { CreateDiaryEntryDto, UpdateDiaryEntryDto } from './dto/diary-entry.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('diary-entries')
export class DiaryEntriesController {
  constructor(private readonly service: DiaryEntriesService) {}

  @Get()
  @Roles(AppRole.Admin, AppRole.Trainer)
  findAll(@CurrentTenant() tenantId: string, @Query('participantId') participantId?: string) {
    return this.service.findAll(tenantId, participantId);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateDiaryEntryDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateDiaryEntryDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}