import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { TwilioService } from './twilio.service';

@Global()
@Module({
  providers: [MailService, TwilioService],
  exports: [MailService, TwilioService],
})
export class MailModule {}