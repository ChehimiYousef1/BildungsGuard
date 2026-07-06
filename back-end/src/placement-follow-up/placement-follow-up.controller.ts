import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PlacementFollowUpService } from './placement-follow-up.service';
import { CreatePlacementFollowUpDto, UpdatePlacementFollowUpDto } from './dto/placement-follow-up.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('placement-follow-up')
export class PlacementFollowUpController {
  constructor(private readonly service: PlacementFollowUpService) {}

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
  create(@CurrentTenant() tenantId: string, @Body() dto: CreatePlacementFollowUpDto) {
    return this.service.create(tenantId, dto);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePlacementFollowUpDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}