import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCampaignsDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  audience?: string;

  @IsOptional() @IsString()
  channel?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  reach?: number;

  @IsOptional() @IsString()
  openRate?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  sentAt?: string;
}
