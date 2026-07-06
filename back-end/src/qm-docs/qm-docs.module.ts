import { Module } from '@nestjs/common';
import { QmDocsService } from './qm-docs.service';
import { QmDocsController } from './qm-docs.controller';

@Module({
  controllers: [QmDocsController],
  providers: [QmDocsService],
})
export class QmDocsModule {}