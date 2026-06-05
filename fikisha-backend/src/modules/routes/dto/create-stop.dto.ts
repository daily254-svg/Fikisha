import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateStopDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsInt()
  @Min(1)
  sequence!: number;

  @IsOptional()
  @IsInt()
  @Min(50)
  radiusMeters?: number;
}