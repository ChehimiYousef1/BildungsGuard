import {
  Body, Controller, Delete, Get, Param,
  Patch, Post, Query, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionsService } from './sessions.service';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('courseId') courseId?: string,
  ) {
    if (courseId) return this.service.findByCourse(tenantId, courseId);
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer)
  create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Post(':id/video')
  @Roles(AppRole.Admin, AppRole.Trainer)
  @UseInterceptors(FileInterceptor('file'))
  uploadVideo(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    return this.service.uploadVideo(tenantId, id, file);
  }
}