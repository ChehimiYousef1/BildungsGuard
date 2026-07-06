import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AttendanceEntryDto {
  @IsString() participantId: string;
  @IsBoolean() present: boolean;
  @IsOptional() @IsString() status?: string;
}

export class SubmitAttendanceDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => AttendanceEntryDto)
  entries: AttendanceEntryDto[];
}
