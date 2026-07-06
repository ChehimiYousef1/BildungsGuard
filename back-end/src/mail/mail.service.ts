import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('smtp.host');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('smtp.port'),
        auth: { user: this.config.get<string>('smtp.user'), pass: this.config.get<string>('smtp.pass') },
      });
    }
  }

  async send(to: string, subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn(`SMTP not configured - skipping email to ${to} ("${subject}")`);
      return { skipped: true };
    }
    const from = this.config.get<string>('smtp.from');
    await this.transporter.sendMail({ from, to, subject, html });
    return { sent: true };
  }
}
