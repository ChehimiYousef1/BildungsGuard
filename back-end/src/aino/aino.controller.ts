import { Body, Controller, Post } from '@nestjs/common';
import { AinoService } from './aino.service';
import { ChatDto } from './dto/chat.dto';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';

@Controller('aino')
export class AinoController {
  constructor(private readonly service: AinoService) {}

  @Post('chat')
  chat(@CurrentTenant() tenantId: string, @Body() dto: ChatDto) {
    return this.service.chat(tenantId, dto);
  }
}
