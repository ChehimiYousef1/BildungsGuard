import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ToggleLessonProgressDto {
  @IsString() participantId: string;
  @IsString() sessionId: string;
  @IsOptional() @IsString() courseId?: string;
  @IsOptional() @IsBoolean() completed?: boolean;
}