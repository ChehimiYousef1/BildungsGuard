import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
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

  // ===== SEND CAMPAIGN =====
  @Post('send')
  @Roles(AppRole.Admin)
  send(
    @CurrentTenant() tenantId: string,
    @Body() dto: {
      name: string;
      audience: string;
      channel: string;
      message?: string;
      measureId?: string;
      stage?: string;
    },
  ) {
    return this.service.sendCampaign(tenantId, dto);
  }

  // ===== PREVIEW RECIPIENTS =====
  @Post('preview-recipients')
  @Roles(AppRole.Admin)
  previewRecipients(
    @CurrentTenant() tenantId: string,
    @Body() dto: { audience?: string; measureId?: string; stage?: string },
  ) {
    return this.service.previewRecipients(tenantId, dto);
  }

  // ===== TRACKING PIXEL =====
  @Public()
  @Get('track/:trackId.png')
  async track(@Param('trackId') trackId: string, @Res() res: Response) {
    await this.service.track(trackId);
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );
    res.set('Content-Type', 'image/gif').send(pixel);
  }

  @Get()
  @Roles(AppRole.Admin)
  findAll(@CurrentTenant() tenantId: string) {
    return this.service.findAll(tenantId);
  }

  @Get('channels')
  @Roles(AppRole.Admin)
  findChannels(@CurrentTenant() tenantId: string) {
    return this.service.findChannels(tenantId);
  }

  @Patch('channels/:id')
  @Roles(AppRole.Admin)
  updateChannel(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: { connected: boolean },
  ) {
    return this.service.updateChannel(tenantId, id, dto);
  }

  @Get(':id')
  @Roles(AppRole.Admin)
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.findOne(tenantId, id);
  }

  @Patch(':id')
  @Roles(AppRole.Admin)
  update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignsDto,
  ) {
    return this.service.update(tenantId, id, dto);
  }

  @Delete(':id')
  @Roles(AppRole.Admin)
  remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.service.remove(tenantId, id);
  }
}
