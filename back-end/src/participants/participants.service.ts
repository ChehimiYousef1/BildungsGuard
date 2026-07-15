import { Injectable, NotFoundException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipantsDto } from './dto/create-participants.dto';
import { UpdateParticipantsDto } from './dto/update-participants.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(tenantId: string, dto: CreateParticipantsDto) {
    const { email, password, sendWelcomeEmail, ...rest } = dto;

    const participant = await this.prisma.client.participant.create({
      data: {
        ...rest,
        contact: email ?? rest.contact,
        tenantId,
      },
    });

    // لو الأدمِن أدخل email + password → أنشئ حساب دخول للمتدرّب
    if (email && password) {
      await this.prisma.runAsTenant(tenantId, async (tx) => {
        await tx.user.create({
          data: {
            email,
            password: await bcrypt.hash(password, 10),
            role: 'participant',
            name: rest.name,
            tenantId,
          },
        });
      });
    }

    // Send welcome email with credentials
    if (email && password && dto.sendWelcomeEmail !== false) {
      const name = rest.name || 'Teilnehmer';
      try {
        await this.mail.send(
          email,
          'Ihre Zugangsdaten / Your login credentials',
          `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
            <h2 style="color:#6D5DF6">Willkommen / Welcome, ${name}!</h2>
            <p>Hier sind Ihre Zugangsdaten f�r das Teilnehmerportal:</p>
            <p>Here are your login credentials for the participant portal:</p>
            <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0">
              <p><strong>E-Mail:</strong> ${email}</p>
              <p><strong>Passwort / Password:</strong> ${password}</p>
            </div>
            <p>Portal: <a href="http://localhost:5173">http://localhost:5173</a></p>
            <p style="color:#888;font-size:12px">Bitte �ndern Sie Ihr Passwort nach der ersten Anmeldung.<br>Please change your password after first login.</p>
          </div>`
        );
      } catch (e) {
        console.error('Welcome email failed:', e);
      }
    }
    return participant;
  }

  findAll(tenantId: string) {
    return this.prisma.client.participant.findMany({
      where: { tenantId },
      include: { measure: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.participant.findFirst({
      where: { id, tenantId },
      include: { measure: true },
    });
    if (!row) throw new NotFoundException('Participant not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateParticipantsDto) {
    await this.findOne(tenantId, id);
    const updated = await this.prisma.client.participant.update({ where: { id }, data: dto });
    if (dto.status === 'completed') {
      const measure = updated.measureId
        ? await this.prisma.client.measure.findFirst({ where: { id: updated.measureId } })
        : null;
      const existing = await this.prisma.client.alumni.findFirst({ where: { tenantId, name: updated.name } });
      if (!existing) {
        await this.prisma.client.alumni.create({
          data: {
            name:        updated.name,
            measure:     measure?.name ?? '',
            outcome:     'unknown',
            graduatedAt: new Date().toISOString().slice(0, 10),
            tenantId,
          },
        });
        console.log('[Alumni] Auto-created:', updated.name, '| Bootcamp:', measure?.name ?? '-');
      }
    }
    return updated;
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.participant.delete({ where: { id } });
  }
}