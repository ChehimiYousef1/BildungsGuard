import { PartialType } from '@nestjs/mapped-types';
import { CreateAutomationsDto } from './create-automations.dto';

export class UpdateAutomationsDto extends PartialType(CreateAutomationsDto) {}
