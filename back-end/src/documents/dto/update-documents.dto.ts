import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentsDto } from './create-documents.dto';

export class UpdateDocumentsDto extends PartialType(CreateDocumentsDto) {}
