import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSurveyDto {
  @IsString() participantId: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @Type(() => Number) @IsInt() rating?: number;
  @IsOptional() @Type(() => Number) @IsInt() maxRating?: number;
  @IsOptional() @IsString() score?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() surveyDate?: string;
}

export class UpdateSurveyDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @Type(() => Number) @IsInt() rating?: number;
  @IsOptional() @Type(() => Number) @IsInt() maxRating?: number;
  @IsOptional() @IsString() score?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() surveyDate?: string;
}