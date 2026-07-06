import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { QmDocsService } from './qm-docs.service';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('qm-docs')
export class QmDocsController {
  constructor(private readonly service: QmDocsService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Post()
  @Roles(AppRole.Admin)
  create(@CurrentTenant() tenantId: string, @Body() dto: any) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}