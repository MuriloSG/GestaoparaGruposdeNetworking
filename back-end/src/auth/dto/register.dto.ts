import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  full_name: string;

  @IsEmail({}, { message: 'O email deve ser válido.' })
  @IsNotEmpty({ message: 'O email é obrigatório.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.',
  })
  password: string;
}