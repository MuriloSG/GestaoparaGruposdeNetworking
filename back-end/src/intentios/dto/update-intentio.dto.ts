import { PartialType } from '@nestjs/mapped-types';
import { CreateIntentioDto } from './create-intentio.dto';

export class UpdateIntentioDto extends PartialType(CreateIntentioDto) {}
