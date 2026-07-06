import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateCourseEvaluationDto {
  @IsOptional() @IsString()
  courseId?: string;

  @IsOptional() @IsString()
  measureId?: string;

  @IsOptional() @IsString()
  period?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5)
  overallRating?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5)
  contentRating?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(5)
  trainerRating?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  participantCount?: number;

  @IsOptional() @IsString()
  strengths?: string;

  @IsOptional() @IsString()
  improvements?: string;

  @IsOptional() @IsString()
  notes?: string;
}

export class UpdateCourseEvaluationDto extends PartialType(CreateCourseEvaluationDto) {}