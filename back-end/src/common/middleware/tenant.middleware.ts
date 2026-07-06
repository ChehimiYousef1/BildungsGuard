import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/** Resolves a tenant hint from a header before auth (auth fills the authoritative tenantId). */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, _res: Response, next: NextFunction) {
    const header = req.headers['x-tenant-id'];
    if (typeof header === 'string') req.tenantId = header;
    next();
  }
}
