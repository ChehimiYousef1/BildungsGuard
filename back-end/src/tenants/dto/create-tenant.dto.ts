import { IsArray, IsOptional, IsString } from 'class-validator';
export class CreateTenantDto {
  @IsString() name: string;
  @IsOptional() @IsString() logo?: string;
  @IsOptional() @IsString() accent?: string;
  @IsOptional() @IsString() azavValidUntil?: string;
  @IsOptional() @IsString() certifier?: string;
  @IsOptional() @IsString() nextAudit?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) enabledModules?: string[];
}
