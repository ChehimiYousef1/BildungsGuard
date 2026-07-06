import { PartialType } from '@nestjs/mapped-types';
import { CreateMeasuresDto } from './create-measures.dto';

export class UpdateMeasuresDto extends PartialType(CreateMeasuresDto) {}
