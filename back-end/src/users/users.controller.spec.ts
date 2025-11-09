import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    full_name: 'Test User',
    email: 'test@example.com',
    password_hash: 'hashedPassword',
    is_admin: false,
    is_member: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockCurrentUser = {
    id: 1,
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn().mockResolvedValue(mockUser),
      findAll: jest.fn().mockResolvedValue([mockUser]),
      findOne: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        full_name: 'Test User',
        email: 'test@example.com',
        password: 'Test123!@#',
        is_admin: false,
        is_member: true,
      };

      const result = await controller.create(createUserDto);
      
      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await controller.findAll(mockCurrentUser);
      
      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await controller.findOne('1', mockCurrentUser);
      
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        is_member: true
      };

      const result = await controller.update('1', updateUserDto, mockCurrentUser);
      
      expect(result).toEqual(mockUser);
      expect(service.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw error when trying to update another user profile', async () => {
      const updateUserDto: UpdateUserDto = {
        is_member: true
      };

      const differentUser = { ...mockCurrentUser, id: 2 };

      try {
        await controller.update('1', updateUserDto, differentUser);
        fail('Deveria ter lançado UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Você só pode atualizar seu próprio perfil');
      }
    });
  });

  describe('getProfile', () => {
    it('should return the current user profile', async () => {
      const result = await controller.getProfile(mockCurrentUser);
      
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(mockCurrentUser.id);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await controller.remove('1');
      
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
