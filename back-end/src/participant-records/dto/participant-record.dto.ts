import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateParticipantRecordDto {
  @IsString() participantId: string;
  @IsString() type: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() recordDate?: string;
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsBoolean() signed?: boolean;
}

export class UpdateParticipantRecordDto {
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() @IsString() recordDate?: string;
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsBoolean() signed?: boolean;
}