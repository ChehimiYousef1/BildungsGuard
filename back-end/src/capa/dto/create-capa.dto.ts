import { IsOptional, IsString } from 'class-validator';

export class CreateCapaDto {
  @IsString()
  description: string;

  @IsOptional() @IsString()
  date?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  category?: string;

  @IsOptional() @IsString()
  owner?: string;

  @IsOptional() @IsString()
  dueDate?: string;

  @IsOptional() @IsString()
  status?: string;
}
