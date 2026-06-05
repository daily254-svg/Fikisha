import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateStopDto } from './create-stop.dto';
import { RouteDirection } from '../../../../generated/prisma/client';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(RouteDirection)
  direction!: RouteDirection;

  @IsOptional()
  @IsUUID()
  busId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStopDto)
  @ArrayMinSize(1)
  stops!: CreateStopDto[];
}