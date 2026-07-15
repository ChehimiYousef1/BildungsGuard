import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { SupportService } from './support.service';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('support')
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @Get()
  findAll(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('type')   type?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(tenantId, user, status, type, search);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.service.create(tenantId, user, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: { status: string },
  ) {
    return this.service.updateStatus(tenantId, id, dto.status);
  }

  @Post(':id/messages')
  addMessage(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.service.addMessage(tenantId, user, id, dto);
  }

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req: any, _file: any, cb: any) => {
        const dir = path.join(process.cwd(), 'uploads', 'support');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req: any, file: any, cb: any) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/[^\w.\-]/g, '_'));
      },
    }),
  }))
  uploadFile(@Param('id') id: string, @UploadedFile() file: any) {
    if (!file) return { error: 'No file' };
    return { url: '/uploads/support/' + file.filename };
  }
}