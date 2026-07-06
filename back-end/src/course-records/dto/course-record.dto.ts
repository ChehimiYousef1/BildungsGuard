import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseRecordDto {
  @IsString() courseId: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() recordDate?: string;
  @IsOptional() @IsString() topic?: string;
  @IsOptional() @IsString() trainer?: string;
  @IsOptional() @Type(() => Number) @IsInt() hours?: number;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateCourseRecordDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() recordDate?: string;
  @IsOptional() @IsString() topic?: string;
  @IsOptional() @IsString() trainer?: string;
  @IsOptional() @Type(() => Number) @IsInt() hours?: number;
  @IsOptional() @IsString() notes?: string;
}