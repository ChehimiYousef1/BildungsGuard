import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CourseRecordsService } from './course-records.service';
import { CreateCourseRecordDto, UpdateCourseRecordDto } from './dto/course-record.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('course-records')
export class CourseRecordsController {
  constructor(private readonly service: CourseRecordsService) {}

  @Get()
  @Roles(AppRole.Admin, AppRole.Trainer)
  findAll(@CurrentTenant() tenantId: string, @Query('courseId') courseId?: string) {
    return this.service.findAll(tenantId, courseId);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateCourseRecordDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateCourseRecordDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}