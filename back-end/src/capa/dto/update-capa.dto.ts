import { PartialType } from '@nestjs/mapped-types';
import { CreateCapaDto } from './create-capa.dto';

export class UpdateCapaDto extends PartialType(CreateCapaDto) {}
