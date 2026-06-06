import { IsISO8601, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class GpsUpdateDto {
  @IsUUID()
  busId!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  speed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading?: number;

  @IsISO8601()
  timestamp!: string;
}