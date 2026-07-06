import { Module } from '@nestjs/common';
import { PlacementFollowUpService } from './placement-follow-up.service';
import { PlacementFollowUpController } from './placement-follow-up.controller';

@Module({
  controllers: [PlacementFollowUpController],
  providers: [PlacementFollowUpService],
  exports: [PlacementFollowUpService],
})
export class PlacementFollowUpModule {}