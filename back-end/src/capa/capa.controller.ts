import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CapaService } from './capa.service';
import { CreateCapaDto } from './dto/create-capa.dto';
import { UpdateCapaDto } from './dto/update-capa.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('capa')
export class CapaController {
  constructor(private readonly service: CapaService) {}

  @Post()
  @Roles(AppRole.Admin)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateCapaDto) {
    return this.service.create(tenantId, dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateCapaDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
