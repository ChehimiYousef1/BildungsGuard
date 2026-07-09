import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { TwilioService } from '../mail/twilio.service';
import { CreateCampaignsDto } from './dto/create-campaigns.dto';
import { UpdateCampaignsDto } from './dto/update-campaigns.dto';

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly twilio: TwilioService,
    private readonly config: ConfigService,
  ) {}

  create(tenantId: string, dto: CreateCampaignsDto) {
    return this.prisma.client.campaign.create({ data: { ...dto, tenantId } });
  }

  findAll(tenantId: string) {
    return this.prisma.client.campaign.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.campaign.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Campaigns not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateCampaignsDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.campaign.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.campaign.delete({ where: { id } });
  }

  // ===== FILTER RECIPIENTS =====
  async filterRecipients(
    tenantId: string,
    opts: {
      audience?: string;
      measureId?: string;
      stage?: string;
    }
  ): Promise<{ email: string; name: string }[]> {
    const { audience = 'seg_active', measureId, stage } = opts;
    const now = new Date();

    // Alumni stages
    const alumniStages = ['graduated_1m', 'graduated_3m', 'graduated_6m'];
    const isAlumniStage = stage && alumniStages.includes(stage);

    // Participant stages
    const participantStages = ['onboarding', 'in_progress', 'final_exam'];
    const isParticipantStage = stage && participantStages.includes(stage);

    let results: { email: string; name: string }[] = [];

    // ===== ALUMNI =====
    if (
      audience === 'seg_all_alumni' ||
      audience === 'seg_alumni_emp' ||
      audience === 'seg_alumni_seek' ||
      isAlumniStage
    ) {
      const alumni = await this.prisma.client.alumni.findMany({
        where: {
          tenantId,
          ...(measureId ? { measureId } : {}),
          ...(audience === 'seg_alumni_emp' ? { outcome: 'employed' } : {}),
          ...(audience === 'seg_alumni_seek' ? { outcome: 'seeking' } : {}),
        },
      });

      let filtered = alumni;

      // Filter by graduation stage
      if (isAlumniStage && stage) {
        filtered = alumni.filter((a: any) => {
          if (!a.graduationDate && !a.graduatedAt) return false;
          const gradDate = new Date(a.graduationDate ?? a.graduatedAt);
          const diffDays = Math.floor((now.getTime() - gradDate.getTime()) / 86400000);
          if (stage === 'graduated_1m') return diffDays <= 30;
          if (stage === 'graduated_3m') return diffDays <= 90;
          if (stage === 'graduated_6m') return diffDays <= 180;
          return true;
        });
      }

      results = filtered
        .filter((a: any) => a.contact || a.email)
        .map((a: any) => ({ email: a.contact ?? a.email ?? '', name: a.name ?? '' }));
    }

    // ===== PARTICIPANTS =====
    if (
      audience === 'seg_active' ||
      isParticipantStage
    ) {
      const where: any = {
        tenantId,
        status: { in: ['active', 'enrolled'] },
        ...(measureId ? { measureId } : {}),
      };

      const parts = await this.prisma.client.participant.findMany({ where });

      let filtered = parts;

      // Filter by stage
      if (isParticipantStage && stage) {
        filtered = parts.filter((p: any) => {
          const pct = p.fileCompleteness ?? 0;
          if (stage === 'onboarding')  return pct < 25;
          if (stage === 'in_progress') return pct >= 25 && pct < 75;
          if (stage === 'final_exam')  return pct >= 75;
          return true;
        });
      }

      const partResults = filtered
        .filter((p: any) => p.contact || p.email)
        .map((p: any) => ({ email: p.contact ?? p.email ?? '', name: p.name ?? '' }));

      results = [...results, ...partResults];
    }

    // Remove duplicates and empty emails
    const seen = new Set<string>();
    return results.filter((r) => {
      if (!r.email || seen.has(r.email)) return false;
      seen.add(r.email);
      return true;
    });
  }

  // ===== PREVIEW RECIPIENTS (new endpoint) =====
  async previewRecipients(
    tenantId: string,
    opts: { audience?: string; measureId?: string; stage?: string }
  ) {
    const recipients = await this.filterRecipients(tenantId, opts);
    return { total: recipients.length, recipients };
  }

  // ===== SEND CAMPAIGN =====
  async sendCampaign(
    tenantId: string,
    dto: {
      name: string;
      audience: string;
      channel: string;
      message?: string;
      measureId?: string;
      stage?: string;
    },
  ) {
    const trackId = randomBytes(8).toString('hex');

    // Get filtered recipients
    const recipients = await this.filterRecipients(tenantId, {
      audience: dto.audience,
      measureId: dto.measureId,
      stage: dto.stage,
    });

    let sent = 0;

    if (dto.channel === 'email' && recipients.length > 0) {
      const tenant = await this.prisma.client.tenant.findFirst({ where: { id: tenantId } });
      const trackingPixel = `<img src="${this.config.get('appUrl') ?? 'http://localhost:3000'}/api/v1/campaigns/track/${trackId}.png" width="1" height="1" />`;

      for (const r of recipients) {
        try {
          await this.mail.send(
            r.email,
            dto.name,
            `<p>Hallo ${r.name},</p><p>${(dto.message ?? '').replace(/\n/g, '<br>')}</p>${trackingPixel}`,
          );
          sent++;
        } catch (e) {
          console.error(`Failed to send to ${r.email}:`, e);
        }
      }
    }

    // Save campaign record
    const campaign = await this.prisma.client.campaign.create({
      data: {
        tenantId,
        name: dto.name,
        audience: dto.audience,
        channel: dto.channel,
        reach: recipients.length,
        status: sent > 0 ? 'sent' : 'saved',
        trackId,
      },
    });

    return {
      ...campaign,
      sent,
      totalRecipients: recipients.length,
    };
  }

  // ===== TRACKING =====
  async track(trackId: string) {
    await this.prisma.client.campaign.updateMany({
      where: { trackId },
      data: { openRate: '1 open' },
    });
  }

  // ===== CHANNELS =====
  findChannels(tenantId: string) {
    return this.prisma.client.channel.findMany({ where: { tenantId } }).catch(() => []);
  }

  updateChannel(tenantId: string, id: string, dto: { connected: boolean }) {
    return this.prisma.client.channel.update({ where: { id }, data: dto }).catch(() => ({}));
  }
}
