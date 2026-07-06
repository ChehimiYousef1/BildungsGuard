import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class CreatePlacementFollowUpDto {
  @IsString()
  participantId: string;

  @IsOptional() @Type(() => Number) @IsInt()
  month?: number; // 0 = at placement end, 6 = 6-month follow-up

  @IsOptional() @IsString()
  outcome?: string; // employed | job_seeking | education | training | other

  @IsOptional() @IsString()
  employer?: string;

  @IsOptional() @IsString()
  jobTitle?: string;

  @IsOptional() @IsString()
  contractType?: string; // permanent | temporary | freelance

  @IsOptional() @IsString()
  followUpDate?: string;

  @IsOptional() @IsString()
  notes?: string;

  @IsOptional() @IsBoolean()
  consentGiven?: boolean;
}

export class UpdatePlacementFollowUpDto extends PartialType(CreatePlacementFollowUpDto) {}