import { Module } from '@nestjs/common';
import { AinoService } from './aino.service';
import { AinoController } from './aino.controller';

@Module({
  controllers: [AinoController],
  providers: [AinoService],
})
export class AinoModule {}
