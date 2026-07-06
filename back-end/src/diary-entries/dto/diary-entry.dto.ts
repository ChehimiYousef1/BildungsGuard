import { IsOptional, IsString } from 'class-validator';

export class CreateDiaryEntryDto {
  @IsString() participantId: string;
  @IsOptional() @IsString() entryDate?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() method?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateDiaryEntryDto {
  @IsOptional() @IsString() entryDate?: string;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() position?: string;
  @IsOptional() @IsString() method?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
}