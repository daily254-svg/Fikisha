import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class LinkParentDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  parentId!: string;

  @IsString()
  @IsNotEmpty()
  relationship!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}