import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateDriverDto extends CreateUserDto {
  @IsOptional()
  @IsString()
  licenseNo?: string;

  @IsOptional()
  @IsString()
  employeeNo?: string;
}