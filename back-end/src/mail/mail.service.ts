import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = process.env.SMTP_HOST || this.config.get<string>('smtp.host');
    const user = process.env.SMTP_USER || this.config.get<string>('smtp.user');
    const pass = process.env.SMTP_PASS || this.config.get<string>('smtp.pass');
    this.logger.log('SMTP host: ' + host + ' | user: ' + user);
    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        requireTLS: true,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
      this.logger.log('SMTP transporter ready: ' + user);
    } else {
      this.logger.warn('SMTP not configured: host=' + host + ' user=' + user);
    }
  }

  async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn(`SMTP not configured - skipping email to ${to} ("${subject}")`);
      return { skipped: true };
    }
    const from = process.env.SMTP_FROM || this.config.get<string>('smtp.from');
    await this.transporter.sendMail({ from, to, subject, html });
    return { sent: true };
  }
}
