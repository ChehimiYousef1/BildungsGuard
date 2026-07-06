import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Append-only action log. Records are never updated or deleted. */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  record(tenantId: string, action: string, meta?: { entity?: string; entityId?: string; userId?: string; data?: any }) {
    return this.prisma.client.auditLog.create({
      data: { action, tenantId, entity: meta?.entity, entityId: meta?.entityId, userId: meta?.userId, data: meta?.data },
    });
  }

  list(tenantId: string) {
    return this.prisma.client.auditLog.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' }, take: 200 });
  }
}
