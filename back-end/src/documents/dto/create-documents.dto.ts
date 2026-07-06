import { IsOptional, IsString } from 'class-validator';

// 25 AZAV Document types
export const DOC_TYPES = {
  // Per-participant
  PARTICIPANT_CONTRACT: 'PARTICIPANT_CONTRACT',
  EQUIPMENT_LOAN:       'EQUIPMENT_LOAN',
  PRIVACY_CONSENT:      'PRIVACY_CONSENT',
  MEDIA_CONSENT:        'MEDIA_CONSENT',
  SICK_NOTE:            'SICK_NOTE',
  CV:                   'CV',
  CERTIFICATE:          'CERTIFICATE',
  // Free-form / legacy
  OTHER:                'OTHER',
} as const;

export class CreateDocumentsDto {
  @IsString()
  type: string;

  @IsOptional() @IsString()
  responsible?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  fileRef?: string;

  @IsOptional() @IsString()
  participantId?: string;

  @IsOptional() @IsString()
  measureId?: string;
}