import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger('TwilioService');
  private client: any = null;

  constructor(private readonly config: ConfigService) {
    const sid = this.config.get<string>('twilio.accountSid');
    const token = this.config.get<string>('twilio.authToken');
    if (sid && token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const twilio = require('twilio');
        this.client = twilio(sid, token);
        this.logger.log('Twilio client ready');
      } catch (e) {
        this.logger.warn('Twilio package not available');
      }
    } else {
      this.logger.warn('Twilio credentials not set — SMS/WhatsApp disabled');
    }
  }

  get enabled() {
    return !!this.client;
  }

  // إرسال SMS
  async sendSms(to: string, body: string): Promise<boolean> {
    if (!this.client) return false;
    const from = this.config.get<string>('twilio.smsFrom');
    if (!from) return false;
    try {
      await this.client.messages.create({ from, to, body });
      return true;
    } catch (e: any) {
      this.logger.warn(`SMS failed to ${to}: ${e?.message}`);
      return false;
    }
  }

  // إرسال WhatsApp
  async sendWhatsapp(to: string, body: string): Promise<boolean> {
    if (!this.client) return false;
    const from = this.config.get<string>('twilio.whatsappFrom');
    if (!from) return false;
    try {
      await this.client.messages.create({ from, to: `whatsapp:${to}`, body });
      return true;
    } catch (e: any) {
      this.logger.warn(`WhatsApp failed to ${to}: ${e?.message}`);
      return false;
    }
  }
}