import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBusDto {
  @IsString()
  @IsNotEmpty()
  registrationNumber!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}