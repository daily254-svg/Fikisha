import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateRouteDto } from './create-route.dto';

export class UpdateRouteDto extends PartialType(
  OmitType(CreateRouteDto, ['stops'] as const),
) {}