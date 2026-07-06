import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class DrawSampleDto {
  @Type(() => Number) @IsInt() @Min(1) @Max(50) n: number;
}
