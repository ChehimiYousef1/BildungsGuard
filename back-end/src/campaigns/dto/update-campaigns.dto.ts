import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignsDto } from './create-campaigns.dto';

export class UpdateCampaignsDto extends PartialType(CreateCampaignsDto) {}
