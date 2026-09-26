import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IncidentType } from '../../../../generated/prisma/client';

export class CreateIncidentDto {
  @IsEnum(IncidentType)
  type!: IncidentType;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}
