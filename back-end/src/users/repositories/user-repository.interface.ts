import { User } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';

export type CreateUserData = Omit<CreateUserDto, 'password'> & {
  password_hash: string;
};

export interface UserRepository {
  create(data: CreateUserData): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: number): Promise<User | null>;
  findOneByEmail(email: string): Promise<User | null>;
  update(id: number, data: UpdateUserDto): Promise<User>;
  delete(id: number): Promise<void>;
}