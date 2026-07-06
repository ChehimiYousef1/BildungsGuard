import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CourseEvaluationsService } from './course-evaluations.service';
import { CreateCourseEvaluationDto, UpdateCourseEvaluationDto } from './dto/course-evaluation.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('course-evaluations')
export class CourseEvaluationsController {
  constructor(private readonly service: CourseEvaluationsService) {}

  @Get('summary')
  @Roles(AppRole.Admin)
  summary(
    @CurrentTenant() tenantId: string,
    @Query('measureId') measureId?: string,
  ) {
    return this.service.summary(tenantId, measureId);
  }

  @Get()
  @Roles(AppRole.Admin, AppRole.Trainer)
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('courseId') courseId?: string,
    @Query('measureId') measureId?: string,
  ) {
    return this.service.findAll(tenantId, courseId, measureId);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateCourseEvaluationDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCourseEvaluationDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}