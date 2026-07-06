import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAutomationsDto {
  @IsString()
  key: string;

  @IsOptional() @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  config?: any;
}
