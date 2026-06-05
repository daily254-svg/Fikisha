import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class AssignStudentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId!: string;

  @IsOptional()
  @IsUUID()
  pickupStopId?: string;

  @IsOptional()
  @IsUUID()
  dropoffStopId?: string;
}