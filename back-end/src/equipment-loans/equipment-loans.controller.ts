import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { EquipmentLoansService } from './equipment-loans.service';
import { CreateEquipmentLoanDto, UpdateEquipmentLoanDto } from './dto/equipment-loan.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('equipment-loans')
export class EquipmentLoansController {
  constructor(private readonly service: EquipmentLoansService) {}

  @Get('stats')
  @Roles(AppRole.Admin)
  stats(@CurrentTenant() tenantId: string) {
    return this.service.stats(tenantId);
  }

  @Get()
  @Roles(AppRole.Admin)
  findAll(
    @CurrentTenant() tenantId: string,
    @Query('participantId') participantId?: string,
  ) {
    return this.service.findAll(tenantId, participantId);
  }

  @Post()
  @Roles(AppRole.Admin)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateEquipmentLoanDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentLoanDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}