import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepositoryMock: any;
  let configServiceMock: any;

  beforeEach(async () => {
    userRepositoryMock = {
      findOne: jest.fn(),
    };

    configServiceMock = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: 'UserRepository',
          useValue: userRepositoryMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      userRepositoryMock.findOne.mockResolvedValue(null);

      const payload = {
        sub: 1,
        email: 'test@test.com',
        is_admin: false,
      };

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return payload when user is found', async () => {
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        is_admin: false,
      };

      userRepositoryMock.findOne.mockResolvedValue(mockUser);

      const payload = {
        sub: 1,
        email: 'test@test.com',
        is_admin: false,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual(payload);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith(payload.sub);
    });
  });
});