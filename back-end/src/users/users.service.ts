import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { UserRepository } from './repositories/user-repository.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const { password, ...userDataWithoutPassword } = createUserDto;
    const userData = {
      ...userDataWithoutPassword,
      password_hash: hashedPassword,
    };

    return this.userRepository.create(userData);
  }

  async findAll() {
    return this.userRepository.findAll();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return this.userRepository.update(id, updateUserDto);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    await this.userRepository.delete(id);
  }
}
