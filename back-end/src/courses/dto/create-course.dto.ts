import { IsOptional, IsString } from 'class-validator';
export class CreateCourseDto {
  @IsString() name: string;
  @IsOptional() @IsString() measureId?: string;
  @IsOptional() @IsString() meetingUrl?: string;
}