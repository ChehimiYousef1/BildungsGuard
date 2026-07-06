import { Module } from '@nestjs/common';
import { EquipmentLoansService } from './equipment-loans.service';
import { EquipmentLoansController } from './equipment-loans.controller';

@Module({
  controllers: [EquipmentLoansController],
  providers: [EquipmentLoansService],
  exports: [EquipmentLoansService],
})
export class EquipmentLoansModule {}