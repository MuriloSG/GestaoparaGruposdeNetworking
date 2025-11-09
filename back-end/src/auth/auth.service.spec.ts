import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepositoryMock: any;
  let jwtServiceMock: any;
  let usersServiceMock: any;

  beforeEach(async () => {
    userRepositoryMock = {
      findOneByEmail: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('test-token'),
    };

    usersServiceMock = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'UserRepository',
          useValue: userRepositoryMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      userRepositoryMock.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password_hash: await bcrypt.hash('correct-password', 10),
        is_admin: false,
      };

      userRepositoryMock.findOneByEmail.mockResolvedValue(mockUser);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token when credentials are valid', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password_hash: await bcrypt.hash('password', 10),
        is_admin: false,
      };

      userRepositoryMock.findOneByEmail.mockResolvedValue(mockUser);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('test-token');
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        is_admin: mockUser.is_admin,
        email: mockUser.email,
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return access token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        is_admin: true,
      };

      usersServiceMock.create.mockResolvedValue(mockUser);

      const result = await service.register({
        full_name: 'Test User',
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('test-token');
      expect(usersServiceMock.create).toHaveBeenCalledWith({
        full_name: 'Test User',
        email: 'test@test.com',
        password: 'password',
        is_admin: true,
        is_member: false,
      });
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        is_admin: mockUser.is_admin,
        email: mockUser.email,
      });
    });
  });
});