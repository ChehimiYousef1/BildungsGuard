import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMeasuresDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  number?: string;

  @IsOptional() @IsString()
  azav?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  capacity?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  enrolled?: number;

  @IsOptional() @Type(() => Number) @IsInt()
  ueHours?: number;

  @IsOptional() @IsString()
  mode?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  startDate?: string;

  @IsOptional() @IsString()
  endDate?: string;
}
