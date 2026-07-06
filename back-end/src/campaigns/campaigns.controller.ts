import { Body, Controller, Delete, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignsDto } from './dto/create-campaigns.dto';
import { UpdateCampaignsDto } from './dto/update-campaigns.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { AppRole } from '../common/enums/role.enum';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly service: CampaignsService) {}

  @Post()
  @Roles(AppRole.Admin)
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateCampaignsDto) {
    return this.service.create(tenantId, dto);
  }

  // إرسال حملة فعلية
  @Post('send')
  @Roles(AppRole.Admin)
  send(@CurrentTenant() tenantId: string, @Body() dto: { name: string; audience: string; channel: string; message?: string }) {
    return this.service.sendCampaign(tenantId, dto);
  }

  // بكسل تتبّع الفتح (عام — بريد المستلم يطلبه بلا token)
  @Public()
  @Get('track/:trackId.png')
  async track(@Param('trackId') trackId: string, @Res() res: Response) {
    const png = await this.service.trackOpen(trackId);
    res.set({ 'Content-Type': 'image/png', 'Cache-Control': 'no-store, no-cache, must-revalidate, private', Pragma: 'no-cache' });
    res.end(png);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  // ===== Channels (قبل :id) =====
  @Get('channels')
  listChannels(@CurrentTenant() tenantId: string) {
    return this.service.listChannels(tenantId);
  }

  @Patch('channels/:id')
  @Roles(AppRole.Admin)
  toggleChannel(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body('connected') connected: boolean) {
    return this.service.toggleChannel(tenantId, id, connected);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateCampaignsDto) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}