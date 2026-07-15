import {
  Body, Controller, Delete, Get, Param, Patch, Post,
  Query, Res, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { QuizService } from './quiz.service';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser }   from '../common/decorators/current-user.decorator';
import { Roles }         from '../common/decorators/roles.decorator';
import { AppRole }       from '../common/enums/role.enum';

@Controller('quiz')
export class QuizController {
  constructor(private readonly service: QuizService) {}

  @Get('stats')
  @Roles(AppRole.Admin)
  stats(@CurrentTenant() t: string, @Query('measureId') m?: string) {
    return this.service.getStats(t, m);
  }

  @Get('template')
  @Roles(AppRole.Admin, AppRole.Trainer)
  template(@Res() res: Response) {
    const buf = this.service.getTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=quiz_template.xlsx');
    res.send(buf);
  }

  @Get()
  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)
  findAll(@CurrentTenant() t: string, @Query('measureId') m?: string) {
    return this.service.findAll(t, m);
  }

  @Get(':id')
  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)
  findOne(@CurrentTenant() t: string, @Param('id') id: string) {
    return this.service.findOne(t, id);
  }

  @Post()
  @Roles(AppRole.Admin, AppRole.Trainer)
  create(@CurrentTenant() t: string, @Body() dto: any) {
    return this.service.create(t, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  update(@CurrentTenant() t: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(t, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin, AppRole.Trainer)
  remove(@CurrentTenant() t: string, @Param('id') id: string) {
    return this.service.remove(t, id);
  }

  @Post(':id/import')
  @Roles(AppRole.Admin, AppRole.Trainer)
  @UseInterceptors(FileInterceptor('file'))
  importExcel(
    @CurrentTenant() t: string,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.importFromExcel(t, id, file);
  }

  @Get(':id/attempts')
  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)
  getAttempts(
    @CurrentTenant() t: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.service.getAttempts(t, id, user);
  }

  @Delete(':id/attempts/:participantId')
  @Roles(AppRole.Admin, AppRole.Trainer)
  resetAttempt(
    @CurrentTenant() t: string,
    @Param('id') id: string,
    @Param('participantId') participantId: string,
  ) {
    return this.service.resetAttempt(t, id, participantId);
  }

  @Post(':id/attempt')
  @Roles(AppRole.Admin, AppRole.Trainer, AppRole.Participant)
  attempt(
    @CurrentTenant() t: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { participantId?: string; answers: Record<string, string> },
  ) {
    const pid = dto.participantId || user.userId || user.id || 'unknown';
    return this.service.submitAttempt(t, id, pid, dto.answers);
  }
}