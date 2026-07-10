import { Body, Controller, Post, Delete, Get, Param, Patch, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { TrainersService } from './trainers.service';
import { CreateTrainersDto } from './dto/create-trainers.dto';
import { UpdateTrainersDto } from './dto/update-trainers.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('trainers')
export class TrainersController {
  constructor(private readonly service: TrainersService) {}

  @Post()
  @Roles(AppRole.Admin)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateTrainersDto) {
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

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTrainersDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }

  @Post('welcome-email')
  async sendWelcomeEmail(@Body() body: { email: string; name: string; password: string }) {
    try {
      await this.service.sendWelcomeEmail(body.email, body.name, body.password);
      return { sent: true };
    } catch (e) {
      return { sent: false, error: String(e) };
    }
  }

  @Post(':id/cv')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req: any, _file: any, cb: any) => {
        const dir = require('path').join(process.cwd(), 'uploads', 'cv');
        require('fs').mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req: any, file: any, cb: any) => {
        const ext = require('path').extname(file.originalname);
        cb(null, 'cv-' + req.params.id + '-' + Date.now() + ext);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async uploadCv(@Param('id') id: string, @UploadedFile() file: any) {
    console.log('[CV Upload] id:', id, '| file:', file?.originalname ?? 'NO FILE');
    if (!file) return { error: 'No file uploaded' };
    try {
      const cvUrl = '/uploads/cv/' + file.filename;
      await this.service.updateCvRef(id, cvUrl);
      console.log('[CV Upload] SUCCESS url:', cvUrl);
      return { url: cvUrl, filename: file.filename };
    } catch (e) {
      console.error('[CV Upload] ERROR:', e.message);
      throw e;
    }
  }
}