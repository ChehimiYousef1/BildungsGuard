import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string) {
    return this.prisma.client.session.findMany({
      where: { tenantId },
      include: {
        course: { select: { id: true, name: true, measureId: true } },
      },
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
    });
  }

  findByCourse(tenantId: string, courseId: string) {
    return this.prisma.client.session.findMany({
      where: { tenantId, courseId },
      orderBy: { order: 'asc' },
    });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.client.session.findFirst({
      where: { id, tenantId },
      include: {
        course: { select: { id: true, name: true, measureId: true } },
      },
    });
  }

  create(tenantId: string, dto: any) {
    return this.prisma.withTenant((tx) =>
      tx.session.create({ data: { ...dto, tenantId } }),
    );
  }

  update(tenantId: string, id: string, dto: any) {
    return this.prisma.withTenant((tx) =>
      tx.session.update({ where: { id }, data: dto }),
    );
  }

  async remove(tenantId: string, id: string) {
    const session = await this.prisma.client.session.findFirst({ where: { id, tenantId } });
    if (!session) throw new NotFoundException('Session not found');
    return this.prisma.withTenant((tx) => tx.session.delete({ where: { id } }));
  }

  async uploadVideo(tenantId: string, id: string, file: any) {
    const session = await this.prisma.client.session.findFirst({ where: { id, tenantId } });
    if (!session) throw new NotFoundException('Session not found');

    // Save to public/videos/
    const videosDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    const ext      = ((file.originalname as string).split('.').pop() ?? 'mp4').toLowerCase();
    const filename = `${id}-${Date.now()}.${ext}`;
    const filePath = path.join(videosDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    // URL served as static file
    const videoRef = `http://localhost:3000/static/videos/${filename}`;

    await this.prisma.withTenant((tx) =>
      tx.session.update({ where: { id }, data: { videoRef } }),
    );

    return { videoRef };
  }
}