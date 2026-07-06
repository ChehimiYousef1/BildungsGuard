import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { ReorderSessionsDto } from './dto/reorder-sessions.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('courses/:courseId/sessions')
export class SessionsController {
  constructor(private readonly sessions: SessionsService) {}

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer)
  add(@CurrentTenant() tenantId: string, @Param('courseId') courseId: string, @Body() dto: CreateSessionDto) {
    return this.sessions.addSession(tenantId, courseId, dto);
  }

  @Patch('reorder')
  @Roles(AppRole.Admin, AppRole.Trainer)
  reorder(@CurrentTenant() tenantId: string, @Param('courseId') courseId: string, @Body() dto: ReorderSessionsDto) {
    return this.sessions.reorder(tenantId, courseId, dto.order);
  }

  // ===== فيديوهات (يجب أن تكون قبل :sessionId المجرّد) =====

  @Get(':sessionId/videos')
  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)
  listVideos(@CurrentTenant() tenantId: string, @Param('sessionId') sessionId: string) {
    return this.sessions.listVideos(tenantId, sessionId);
  }

  @Post(':sessionId/videos')
  @Roles(AppRole.Admin, AppRole.Trainer)
  @UseInterceptors(FileInterceptor('file'))
  addVideo(
    @CurrentTenant() tenantId: string,
    @Param('sessionId') sessionId: string,
    @UploadedFile() file: any,
    @Body('title') title?: string,
  ) {
    return this.sessions.addVideo(tenantId, sessionId, file, title);
  }

  @Get(':sessionId/videos/:videoId')
  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)
  getVideoUrl(@CurrentTenant() tenantId: string, @Param('videoId') videoId: string) {
    return this.sessions.getVideoUrlById(tenantId, videoId);
  }

  @Delete(':sessionId/videos/:videoId')
  @Roles(AppRole.Admin, AppRole.Trainer)
  removeVideo(@CurrentTenant() tenantId: string, @Param('videoId') videoId: string) {
    return this.sessions.removeVideoById(tenantId, videoId);
  }

  // ===== تحديث/حذف جلسة (المجرّد آخرًا) =====

  @Patch(':sessionId')
  @Roles(AppRole.Admin, AppRole.Trainer)
  update(
    @CurrentTenant() tenantId: string,
    @Param('courseId') courseId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessions.updateSession(tenantId, courseId, sessionId, dto);
  }

  @Delete(':sessionId')
  @Roles(AppRole.Admin, AppRole.Trainer)
  remove(
    @CurrentTenant() tenantId: string,
    @Param('courseId') courseId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessions.removeSession(tenantId, courseId, sessionId);
  }
}