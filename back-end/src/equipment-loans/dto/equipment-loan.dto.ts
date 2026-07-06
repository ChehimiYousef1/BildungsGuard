import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateEquipmentLoanDto {
  @IsString()
  participantId: string;

  @IsString()
  deviceName: string;

  @IsOptional() @IsString()
  serialNumber?: string;

  @IsOptional() @IsString()
  brand?: string;

  @IsOptional() @IsString()
  condition?: string;

  @IsOptional() @IsString()
  loanDate?: string;

  @IsOptional() @IsString()
  returnDate?: string;

  @IsOptional() @IsString()
  returnedDate?: string;

  @IsOptional() @IsBoolean()
  returned?: boolean;

  @IsOptional() @IsBoolean()
  signedByParticipant?: boolean;

  @IsOptional() @IsString()
  notes?: string;
}

export class UpdateEquipmentLoanDto extends PartialType(CreateEquipmentLoanDto) {}