import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

/** Append-only logging of mutating requests (POST/PATCH/PUT/DELETE). */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const mutating = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method);
    return next.handle().pipe(
      tap(async () => {
        if (!mutating || !req.user?.tenantId) return;
        try {
          await this.prisma.client.auditLog.create({
            data: {
              action: `${req.method} ${req.route?.path ?? req.url}`,
              entity: req.route?.path,
              userId: req.user?.userId,
              tenantId: req.user.tenantId,
            },
          });
        } catch {
          /* logging must never break the request */
        }
      }),
    );
  }
}
