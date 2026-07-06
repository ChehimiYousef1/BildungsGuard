import { IsArray, IsString } from 'class-validator';
export class ReorderSessionsDto {
  // Session ids in the desired order
  @IsArray() @IsString({ each: true }) order: string[];
}
