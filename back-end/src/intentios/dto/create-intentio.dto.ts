import { IsString, IsEmail, IsOptional, IsInt } from 'class-validator';

export class CreateIntentioDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsInt()
  group_id: number;

  @IsOptional()
  @IsString()
  token?: string;
}
