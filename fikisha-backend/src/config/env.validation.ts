import { plainToClass } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import { Type } from 'class-transformer';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN!: string;

  @IsString()
  REDIS_HOST!: string;

  @IsNumber()
  @Type(() => Number)
  REDIS_PORT!: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  FIREBASE_SERVICE_ACCOUNT_PATH!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config);
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}