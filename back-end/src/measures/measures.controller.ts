import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { MeasuresService } from './measures.service';
import { CreateMeasuresDto } from './dto/create-measures.dto';
import { UpdateMeasuresDto } from './dto/update-measures.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('measures')
export class MeasuresController {
  constructor(private readonly service: MeasuresService) {}

  @Post()
  @Roles(AppRole.Admin)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateMeasuresDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  // ===== Curriculum modules (قبل :id) =====
  @Get(':id/modules')
  listModules(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.listModules(tenantId, id);
  }

  @Post(':id/modules')
  @Roles(AppRole.Admin)
  addModule(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: { title: string; ueHours?: number; status?: string; order?: number },
  ) {
    return this.service.addModule(tenantId, id, dto);
  }

  @Delete(':id/modules/:moduleId')
  @Roles(AppRole.Admin)
  removeModule(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
  ) {
    return this.service.removeModule(tenantId, id, moduleId);
  }

  // ===== Change history (قبل :id) =====
  @Get(':id/changes')
  listChanges(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.listChanges(tenantId, id);
  }

  @Post(':id/changes')
  @Roles(AppRole.Admin)
  addChange(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: { date?: string; reason: string; responsible?: string },
  ) {
    return this.service.addChange(tenantId, id, dto);
  }

  @Delete(':id/changes/:changeId')
  @Roles(AppRole.Admin)
  removeChange(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Param('changeId') changeId: string,
  ) {
    return this.service.removeChange(tenantId, id, changeId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateMeasuresDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}