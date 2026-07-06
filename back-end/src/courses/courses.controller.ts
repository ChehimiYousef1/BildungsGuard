import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('courses')
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @Post() @Roles(AppRole.Admin)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateCourseDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id') @Roles(AppRole.Admin)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Post(':id/copy') @Roles(AppRole.Admin)
  copy(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body('name') name?: string) {
    return this.service.copy(tenantId, id, name);
  }

  @Delete(':id') @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}