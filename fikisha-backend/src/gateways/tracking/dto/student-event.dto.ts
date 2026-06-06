import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class StudentEventDto {
  @IsUUID()
  busId!: string;

  @IsUUID()
  studentId!: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}