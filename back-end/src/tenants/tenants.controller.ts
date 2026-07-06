import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Get('me')
  me(@CurrentTenant() tenantId: string) {
    return this.service.findOne(tenantId);
  }

  @Patch('me')
  updateMe(@CurrentTenant() tenantId: string, @Body() dto: UpdateTenantDto) {
    return this.service.update(tenantId, dto);
  }

  @Get(':id')
  @Roles(AppRole.Admin)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.service.update(id, dto);
  }
}