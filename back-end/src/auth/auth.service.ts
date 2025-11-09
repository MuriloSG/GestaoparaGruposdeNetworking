import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { UserRepository } from '../users/repositories/user-repository.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      full_name: registerDto.full_name,
      email: registerDto.email,
      password: registerDto.password,
      is_admin: true,
      is_member: false,
    });

    const payload = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}