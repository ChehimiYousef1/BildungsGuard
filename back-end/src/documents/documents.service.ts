import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateDocumentsDto } from './dto/create-documents.dto';
import { UpdateDocumentsDto } from './dto/update-documents.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  create(tenantId: string, dto: CreateDocumentsDto) {
    return this.prisma.client.document.create({ data: { ...dto, tenantId } });
  }

  findAll(tenantId: string) {
    return this.prisma.client.document.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  findForParticipant(tenantId: string, participantId: string) {
    return this.prisma.client.document.findMany({
      where: { tenantId, participantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.document.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Documents not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateDocumentsDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.document.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.document.delete({ where: { id } });
  }

  // رفع ملف إلى MinIO وتخزين مفتاحه على المستند وتعليمه جاهزًا.
  async uploadFile(tenantId: string, id: string, file: { originalname: string; buffer: Buffer; mimetype: string }) {
    await this.findOne(tenantId, id);
    const safeName = file.originalname.replace(/[^\w.\-]/g, '_');
    const objectName = `${tenantId}/documents/${id}/${Date.now()}-${safeName}`;
    await this.storage.upload(objectName, file.buffer, file.mimetype);
    return this.prisma.client.document.update({
      where: { id },
      data: { fileRef: objectName, status: 'doc_ready' },
    });
  }

  // رابط مؤقّت موقّع لتنزيل الملف المخزّن.
  async getFileUrl(tenantId: string, id: string) {
    const row = await this.findOne(tenantId, id);
    if (!row.fileRef) throw new NotFoundException('No file attached to this document');
    const url = await this.storage.presignedGet(row.fileRef, 3600);
    return { url };
  }
}