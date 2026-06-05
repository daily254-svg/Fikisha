import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignDriverDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  driverId!: string;
}