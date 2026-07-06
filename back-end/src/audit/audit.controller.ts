import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AuditService } from './audit.service';
import { DrawSampleDto } from './dto/draw-sample.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('audit')
@Roles(AppRole.Admin)
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get('readiness')
  readiness(@CurrentTenant() tenantId: string) {
    return this.service.readiness(tenantId);
  }

  @Post('sample')
  drawSample(@CurrentTenant() tenantId: string, @CurrentUser('userId') userId: string, @Body() dto: DrawSampleDto) {
    return this.service.drawSample(tenantId, dto.n, userId);
  }

  @Get('history')
  history(@CurrentTenant() tenantId: string) {
    return this.service.history(tenantId);
  }

  @Get('log')
  logs(@CurrentTenant() tenantId: string) {
    return this.service.logs(tenantId);
  }

  // ===== External audits =====
  @Get('external')
  listExternal(@CurrentTenant() tenantId: string) {
    return this.service.listExternal(tenantId);
  }

  @Post('external')
  addExternal(
    @CurrentTenant() tenantId: string,
    @Body() dto: { date?: string; body?: string; type?: string; findings?: string; status?: string },
  ) {
    return this.service.addExternal(tenantId, dto);
  }

  @Delete('external/:id')
  removeExternal(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.removeExternal(tenantId, id);
  }
}