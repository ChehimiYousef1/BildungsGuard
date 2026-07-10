import { IsOptional, IsString } from 'class-validator';

export class CreateTrainersDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  qualificationArea?: string;

  @IsOptional() @IsString()
  qualificationStatus?: string;

  @IsOptional() @IsString()
  expiry?: string;

  @IsOptional() @IsString()
  email?: string;

  @IsOptional() @IsString()
  password?: string;
}
