import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateSessionDto {
  @IsString() title: string;
  @IsOptional() @Type(() => Number) @IsInt() order?: number;
  @IsOptional() @IsString() time?: string;
  @IsOptional() @IsString() room?: string;
}
