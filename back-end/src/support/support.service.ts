import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, user: any, status?: string, type?: string, search?: string) {
    const where: any = { tenantId };
    if (user.role !== 'admin' && user.role !== 'verwaltung') {
      where.userId = user.userId ?? user.id ?? user.sub;
    }
    if (status) where.status = status;
    if (type)   where.type   = type;
    if (search) where.subject = { contains: search, mode: 'insensitive' };
    return this.prisma.client.supportTicket.findMany({
      where,
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.client.supportTicket.findFirst({
      where: { id, tenantId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async create(tenantId: string, user: any, dto: any) {
    console.log('[Support] create - user:', JSON.stringify(user));
    const userId   = user.userId ?? user.id ?? user.sub ?? 'unknown';
    const userName = user.name ?? user.username ?? user.email ?? 'User';
    return this.prisma.client.supportTicket.create({
      data: {
        subject:  dto.subject,
        type:     dto.type,
        status:   'open',
        userId,
        userRole: user.role,
        userName,
        tenantId,
        messages: {
          create: {
            senderId:   userId,
            senderName: userName,
            senderRole: user.role,
            content:    dto.message,
            fileRef:    dto.fileRef ?? null,
            tenantId,
          },
        },
      },
      include: { messages: true },
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    return this.prisma.client.supportTicket.update({
      where: { id },
      data:  { status },
    });
  }

  async addMessage(tenantId: string, user: any, ticketId: string, dto: any) {
    console.log('[Support] addMessage - user:', JSON.stringify(user), '| ticketId:', ticketId);
    const userId   = user.userId ?? user.id ?? user.sub ?? 'unknown';
    const userName = user.name ?? user.username ?? user.email ?? 'User';
    try {
      const msg = await this.prisma.client.supportMessage.create({
        data: {
          ticketId,
          senderId:   userId,
          senderName: userName,
          senderRole: user.role,
          content:    dto.content,
          fileRef:    dto.fileRef ?? null,
          tenantId,
        },
      });
      await this.prisma.client.supportTicket.update({
        where: { id: ticketId },
        data:  { updatedAt: new Date() },
      });
      return msg;
    } catch(e: any) {
      console.error('[Support] addMessage ERROR:', e.message);
      throw e;
    }
  }
}
