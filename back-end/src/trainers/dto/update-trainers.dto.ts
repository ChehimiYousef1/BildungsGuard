import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainersDto } from './create-trainers.dto';

export class UpdateTrainersDto extends PartialType(CreateTrainersDto) {}
