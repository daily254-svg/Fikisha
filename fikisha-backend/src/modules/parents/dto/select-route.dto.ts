import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class SelectRouteDto {
  @IsUUID()
  @IsNotEmpty()
  routeId!: string;

  @IsUUID()
  @IsOptional()
  pickupStopId?: string;

  @IsUUID()
  @IsOptional()
  dropoffStopId?: string;
}
