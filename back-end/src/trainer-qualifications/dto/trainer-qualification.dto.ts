import { IsOptional, IsString } from 'class-validator';

export class CreateTrainerQualificationDto {
  @IsString() title: string;
  @IsOptional() @IsString() trainerName?: string;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() validUntil?: string;
  @IsOptional() @IsString() approvedFor?: string;
  @IsOptional() @IsString() fileRef?: string;
}

export class UpdateTrainerQualificationDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() trainerName?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() validUntil?: string;
  @IsOptional() @IsString() approvedFor?: string;
  @IsOptional() @IsString() fileRef?: string;
}