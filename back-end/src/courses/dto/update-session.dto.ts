import { IsOptional, IsString } from 'class-validator';

export class UpdateSessionDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() time?: string | null;
  @IsOptional() @IsString() room?: string | null;
  @IsOptional() @IsString() meetingUrl?: string | null;
}