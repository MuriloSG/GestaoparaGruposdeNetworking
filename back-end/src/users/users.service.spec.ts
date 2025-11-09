import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository;

  const mockUser = {
    id: 1,
    full_name: 'Test User',
    email: 'test@example.com',
    password_hash: 'hashedPassword',
    is_admin: false,
    is_member: true,
  };

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findOneByEmail: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'UserRepository',
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!@#',
      is_admin: false,
      is_member: true,
    };

    it('should create a new user successfully', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findOneByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        full_name: createUserDto.full_name,
        email: createUserDto.email,
        password_hash: 'hashedPassword',
        is_admin: createUserDto.is_admin,
        is_member: createUserDto.is_member,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOneByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createUserDto)).rejects.toThrow('Email já está em uso.');
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      mockUserRepository.findAll.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toEqual([mockUser]);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Usuário com ID 999 não encontrado.');
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      is_member: true
    };

    it('should update a user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({
        ...mockUser,
        is_member: true
      });

      const result = await service.update(1, updateUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result.is_member).toBe(true);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(999, updateUserDto)).rejects.toThrow('Usuário com ID 999 não encontrado.');
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      await expect(service.remove(999)).rejects.toThrow('Usuário com ID 999 não encontrado.');
    });
  });
});
