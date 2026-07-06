import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAlumniDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  measure?: string;

  @IsOptional() @IsString()
  outcome?: string;

  @IsOptional() @IsString()
  employer?: string;

  @IsOptional() @IsBoolean()
  followUp6?: boolean;

  @IsOptional() @IsBoolean()
  consent?: boolean;

  @IsOptional() @IsString()
  graduatedAt?: string;

  // متابعة AZAV: شهر 0 + شهر 6
  @IsOptional() @IsString()
  status0?: string;

  @IsOptional() @IsString()
  status6?: string;

  @IsOptional() @IsString()
  employer6?: string;

  @IsOptional() @IsString()
  followUp0At?: string;

  @IsOptional() @IsString()
  followUp6At?: string;
}