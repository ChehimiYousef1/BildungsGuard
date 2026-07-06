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
    return this.prisma.client.campaign.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
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

  // ===== Channels =====
  async listChannels(tenantId: string) {
    const rows = await this.prisma.client.channel.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    if (rows.length === 0) {
      const defaults = [
        { name: 'Email', type: 'email', connected: true, reach: 0 },
        { name: 'SMS', type: 'sms', connected: false, reach: 0 },
        { name: 'LinkedIn', type: 'linkedin', connected: false, reach: 0 },
        { name: 'WhatsApp', type: 'whatsapp', connected: false, reach: 0 },
      ];
      await this.prisma.client.channel.createMany({ data: defaults.map((d) => ({ ...d, tenantId })) });
      return this.prisma.client.channel.findMany({ where: { tenantId }, orderBy: { createdAt: 'asc' } });
    }
    return rows;
  }

  async toggleChannel(tenantId: string, id: string, connected: boolean) {
    const ch = await this.prisma.client.channel.findFirst({ where: { id, tenantId } });
    if (!ch) throw new NotFoundException('Channel not found');
    return this.prisma.client.channel.update({ where: { id }, data: { connected } });
  }

  // جمع المستلمين (إيميل أو هاتف) حسب الجمهور
  private async audience(tenantId: string, audience: string) {
    const parts = await this.prisma.client.participant.findMany({ where: { tenantId } });
    let list = parts;
    if (audience === 'seg_active') {
      list = parts.filter((p: any) => p.status === 'enrolled' || p.status === 'active');
    }
    return list;
  }

  // ===== إرسال حملة فعلية =====
  async sendCampaign(
    tenantId: string,
    dto: { name: string; audience: string; channel: string; message?: string },
  ) {
    const { name, audience, channel, message } = dto;
    const recipients = await this.audience(tenantId, audience);

    // --- Email ---
    if (channel === 'email') {
      const trackId = randomBytes(8).toString('hex');
      const appUrl = this.config.get<string>('appUrl') ?? 'http://localhost:3000';
      const pixel = `<img src="${appUrl}/api/v1/campaigns/track/${trackId}.png" width="1" height="1" style="display:none" alt="">`;
      const html = `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">
        <h2 style="color:#4E2BCD">${name}</h2>
        <p>${(message || '').replace(/\n/g, '<br>')}</p>
        <hr><p style="color:#888;font-size:12px">All in One · AZAV LMS</p></div>${pixel}`;

      const emails = recipients.map((p: any) => (p.contact || '').trim()).filter((c: string) => c.includes('@'));
      let sent = 0;
      for (const to of emails) {
        try { await this.mail.send(to, name, html); sent++; } catch { /* skip */ }
      }
      const campaign = await this.prisma.client.campaign.create({
        data: { name, audience, channel, reach: sent, opens: 0, trackId, openRate: sent > 0 ? '0%' : null, status: sent > 0 ? 'sent' : 'draftC', sentAt: new Date().toLocaleDateString('de-DE'), tenantId },
      });
      return { ...campaign, sent, totalRecipients: emails.length };
    }

    // --- SMS / WhatsApp (عبر Twilio) ---
    if (channel === 'sms' || channel === 'whatsapp') {
      const phones = recipients.map((p: any) => (p.phone || '').trim()).filter((p: string) => p.length > 5);
      const text = `${name}\n\n${message || ''}`;

      // لو Twilio غير مفعّل → سجّل كمسوّدة بصدق
      if (!this.twilio.enabled) {
        const campaign = await this.prisma.client.campaign.create({
          data: { name, audience, channel, reach: 0, status: 'scheduled', tenantId },
        });
        return { ...campaign, sent: 0, totalRecipients: phones.length, note: 'Twilio not configured — saved only' };
      }

      let sent = 0;
      for (const to of phones) {
        const ok = channel === 'sms' ? await this.twilio.sendSms(to, text) : await this.twilio.sendWhatsapp(to, text);
        if (ok) sent++;
      }
      const campaign = await this.prisma.client.campaign.create({
        data: { name, audience, channel, reach: sent, status: sent > 0 ? 'sent' : 'draftC', sentAt: new Date().toLocaleDateString('de-DE'), tenantId },
      });
      return { ...campaign, sent, totalRecipients: phones.length };
    }

    // --- LinkedIn أو غيره: تسجيل فقط ---
    const campaign = await this.prisma.client.campaign.create({
      data: { name, audience, channel, status: 'scheduled', tenantId },
    });
    return { ...campaign, sent: 0, note: 'channel requires external integration' };
  }

  // ===== تسجيل فتح الإيميل =====
  async trackOpen(trackId: string) {
    const campaign = await this.prisma.client.campaign.findFirst({ where: { trackId } });
    if (campaign && campaign.reach > 0) {
      const opens = campaign.opens + 1;
      const rate = Math.min(100, Math.round((opens / campaign.reach) * 100));
      await this.prisma.client.campaign.update({ where: { id: campaign.id }, data: { opens, openRate: `${rate}%` } });
    }
    return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  }
}