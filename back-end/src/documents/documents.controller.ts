import {
  Body, Controller, Delete, Get, Param, Patch, Post,
  UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentsDto } from './dto/create-documents.dto';
import { UpdateDocumentsDto } from './dto/update-documents.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post()
  @Roles(AppRole.Admin)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateDocumentsDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get('participant/:participantId')
  findForParticipant(@CurrentTenant() tenantId: string, @Param('participantId') participantId: string) {
    return this.service.findForParticipant(tenantId, participantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Get(':id/file')
  getFile(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.getFileUrl(tenantId, id);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateDocumentsDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Post(':id/upload')
  @Roles(AppRole.Admin)
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @UploadedFile() file: { originalname: string; buffer: Buffer; mimetype: string },
  ) {
    if (!file) throw new BadRequestException('No file uploaded (field name must be "file")');
    return this.service.uploadFile(tenantId, id, file);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}