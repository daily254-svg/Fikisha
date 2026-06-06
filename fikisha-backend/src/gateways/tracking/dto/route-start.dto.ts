import { IsUUID } from 'class-validator';

export class RouteStartDto {
  @IsUUID()
  busId!: string;

  @IsUUID()
  routeId!: string;
}