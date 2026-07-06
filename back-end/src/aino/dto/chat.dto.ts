import { IsArray, IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ChatMessageDto {
  @IsIn(['user', 'assistant']) role: 'user' | 'assistant';
  @IsString() content: string;
}

export class ChatDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @IsOptional() @IsIn(['de', 'en']) lang?: 'de' | 'en';
}
