import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async addSession(tenantId: string, courseId: string, dto: CreateSessionDto) {
    const order =
      dto.order ??
      (await this.prisma.client.session.count({ where: { courseId, tenantId } }));
    return this.prisma.client.session.create({
      data: {
        title: dto.title,
        time: dto.time,
        room: dto.room,
        meetingUrl: (dto as any).meetingUrl,
        order,
        courseId,
        tenantId,
      },
    });
  }

  // تحديث جلسة (العنوان/الوقت/المكان/رابط الاجتماع)
  async updateSession(
    tenantId: string,
    courseId: string,
    sessionId: string,
    dto: { title?: string; time?: string | null; room?: string | null; meetingUrl?: string | null },
  ) {
    await this.prisma.client.session.updateMany({
      where: { id: sessionId, courseId, tenantId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.time !== undefined ? { time: dto.time } : {}),
        ...(dto.room !== undefined ? { room: dto.room } : {}),
        ...(dto.meetingUrl !== undefined ? { meetingUrl: dto.meetingUrl } : {}),
      },
    });
    return this.prisma.client.session.findFirst({ where: { id: sessionId, courseId, tenantId } });
  }

  // حذف جلسة
  async removeSession(tenantId: string, courseId: string, sessionId: string) {
    await this.prisma.client.session.deleteMany({ where: { id: sessionId, courseId, tenantId } });
    return { ok: true };
  }

  // Persist a new explicit order; index in the array becomes the order field.
  async reorder(tenantId: string, courseId: string, ids: string[]) {
    await this.prisma.withTenant((tx) =>
      Promise.all(
        ids.map((id, index) =>
          tx.session.updateMany({
            where: { id, courseId, tenantId },
            data: { order: index },
          }),
        ),
      ),
    );
    return this.prisma.client.session.findMany({ where: { courseId, tenantId }, orderBy: { order: 'asc' } });
  }

  // ===== فيديوهات متعدّدة لكل جلسة =====

  listVideos(tenantId: string, sessionId: string) {
    return this.prisma.client.sessionVideo.findMany({
      where: { sessionId, tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addVideo(
    tenantId: string,
    sessionId: string,
    file: { originalname: string; buffer: Buffer; mimetype: string },
    title?: string,
  ) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectName = `${tenantId}/videos/${sessionId}/${Date.now()}-${safeName}`;
    await this.storage.upload(objectName, file.buffer, file.mimetype);
    return this.prisma.client.sessionVideo.create({
      data: {
        sessionId,
        title: title?.trim() || file.originalname,
        videoRef: objectName,
        tenantId,
      },
    });
  }

  async getVideoUrlById(tenantId: string, videoId: string) {
    const v = await this.prisma.client.sessionVideo.findFirst({ where: { id: videoId, tenantId } });
    if (!v) throw new NotFoundException('Video not found');
    const url = await this.storage.presignedGet(v.videoRef, 3600);
    return { url };
  }

  async removeVideoById(tenantId: string, videoId: string) {
    await this.prisma.client.sessionVideo.deleteMany({ where: { id: videoId, tenantId } });
    return { ok: true };
  }
}