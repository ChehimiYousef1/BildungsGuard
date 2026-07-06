import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

/** Ensures an authenticated request carries a tenant context. */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!req.user?.tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }
    return true;
  }
}
