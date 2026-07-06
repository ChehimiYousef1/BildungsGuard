import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParticipantsDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  measureId?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  fileCompleteness?: number;

  @IsOptional() @IsString()
  contact?: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  fundingType?: string;

  @IsOptional() @IsString()
  voucher?: string;

  @IsOptional() @IsString()
  voucherValidUntil?: string;

  @IsOptional() @IsString()
  agency?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  password?: string;
}