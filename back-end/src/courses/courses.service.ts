import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  create(tenantId: string, dto: CreateCourseDto) {
    return this.prisma.client.course.create({ data: { ...dto, tenantId } });
  }

  findAll(tenantId: string) {
    return this.prisma.client.course.findMany({
      where: { tenantId },
      include: {
        measure: true,
        sessions: {
          orderBy: { order: 'asc' },
          include: { videos: { orderBy: { createdAt: 'asc' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const course = await this.prisma.client.course.findFirst({
      where: { id, tenantId },
      include: {
        measure: true,
        sessions: {
          orderBy: { order: 'asc' },
          include: { videos: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(tenantId: string, id: string, dto: UpdateCourseDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.course.update({ where: { id }, data: dto });
  }

  async copy(tenantId: string, id: string, name?: string) {
    const src = await this.findOne(tenantId, id);
    return this.prisma.client.course.create({
      data: {
        name: name ?? `${src.name} (Kopie)`,
        measureId: src.measureId,
        tenantId,
        sessions: {
          create: src.sessions.map((s: any) => ({
            title: s.title,
            order: s.order,
            time: s.time,
            room: s.room,
            tenantId,
          })),
        },
      },
      include: {
        measure: true,
        sessions: {
          orderBy: { order: 'asc' },
          include: { videos: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.client.course.delete({ where: { id } });
    return { ok: true };
  }
}