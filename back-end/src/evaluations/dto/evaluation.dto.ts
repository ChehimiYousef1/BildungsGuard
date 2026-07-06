import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEvaluationDto {
  @IsOptional() @IsString() scope?: string;
  @IsOptional() @IsString() participantId?: string;
  @IsOptional() @IsString() courseId?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @Type(() => Number) @IsInt() rating?: number;
  @IsOptional() @IsString() strengths?: string;
  @IsOptional() @IsString() weaknesses?: string;
  @IsOptional() @IsString() recommendation?: string;
  @IsOptional() @IsString() evalDate?: string;
  @IsOptional() @IsString() author?: string;
}

export class UpdateEvaluationDto {
  @IsOptional() @IsString() scope?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @Type(() => Number) @IsInt() rating?: number;
  @IsOptional() @IsString() strengths?: string;
  @IsOptional() @IsString() weaknesses?: string;
  @IsOptional() @IsString() recommendation?: string;
  @IsOptional() @IsString() evalDate?: string;
  @IsOptional() @IsString() author?: string;
}