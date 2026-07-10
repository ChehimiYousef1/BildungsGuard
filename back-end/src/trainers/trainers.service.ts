import { Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainersDto } from './dto/create-trainers.dto';
import { UpdateTrainersDto } from './dto/update-trainers.dto';

@Injectable()
export class TrainersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async create(tenantId: string, dto: CreateTrainersDto) {
    const { email, password, ...rest } = dto as any;
    const trainer = await this.prisma.client.trainer.create({ data: { ...rest, tenantId } });
    console.log('[Trainer] email:', email, '| password:', password ? 'SET' : 'MISSING');
    if (email && password) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: 587,
          secure: false,
          requireTLS: true,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          tls: { rejectUnauthorized: false },
        });
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: 'Ihre Zugangsdaten / Your login credentials',
          html: '<div style="font-family:sans-serif;padding:24px"><h2 style="color:#6D5DF6">Willkommen, ' + (rest.name || 'Trainer') + '!</h2><p><strong>E-Mail:</strong> ' + email + '</p><p><strong>Passwort:</strong> ' + password + '</p><p><a href="http://localhost:5173">Portal Login</a></p></div>',
        });
        console.log('[Trainer] Email sent to:', email);
      } catch (e) { console.error('[Trainer] Email failed:', e.message); }
    }
    return trainer;
  }

  async findAll(tenantId: string) {
    const trainers = await this.prisma.client.trainer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(
      trainers.map(async (tr: any) => {
        if (tr.email) return tr;
        try {
          const user = await this.prisma.client.user.findFirst({
            where: { tenantId, name: tr.name, role: 'trainer' },
            select: { email: true },
          });
          return { ...tr, email: user?.email ?? '' };
        } catch { return tr; }
      })
    );

    return enriched;
  }

  async findOne(tenantId: string, id: string) {
    const row = await this.prisma.client.trainer.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException('Trainers not found');
    return row;
  }

  async update(tenantId: string, id: string, dto: UpdateTrainersDto) {
    await this.findOne(tenantId, id);
    return this.prisma.client.trainer.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.trainer.delete({ where: { id } });
  }

  async sendWelcomeEmail(email: string, name: string, password: string) {
    return this.mail.send(
      email,
      'Ihre Zugangsdaten / Your login credentials',
      '<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">' +
      '<h2 style="color:#6D5DF6">Willkommen / Welcome, ' + name + '!</h2>' +
      '<p>Hier sind Ihre Zugangsdaten fur das Trainer-Portal:</p>' +
      '<p>Here are your login credentials for the trainer portal:</p>' +
      '<div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0">' +
      '<p><strong>E-Mail:</strong> ' + email + '</p>' +
      '<p><strong>Passwort / Password:</strong> ' + password + '</p>' +
      '</div>' +
      '<p>Portal: <a href="http://localhost:5173">http://localhost:5173</a></p>' +
      '<p style="color:#888;font-size:12px">Bitte andern Sie Ihr Passwort nach der ersten Anmeldung.</p>' +
      '</div>'
    );
  }

  

  async updateCvRef(id: string, cvRef: string) {
    // Try direct id first, then by userId via user.name lookup
    let trainer = await this.prisma.client.trainer.findFirst({ where: { id } });
    if (!trainer) {
      // id might be a userId - find trainer by matching user email/name
      const user = await this.prisma.client.user.findFirst({ where: { id }, select: { name: true, email: true } });
      if (user) trainer = await this.prisma.client.trainer.findFirst({ where: { name: user.name } });
    }
    if (!trainer) throw new Error('Trainer not found for id: ' + id);
    return this.prisma.client.trainer.update({ where: { id: trainer.id }, data: { cvRef } });
  }
}