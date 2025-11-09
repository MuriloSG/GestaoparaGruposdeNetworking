import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { IntentiosService } from './intentios.service';
import * as crypto from 'crypto';

jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

describe('IntentiosService', () => {
  let service: IntentiosService;
  let intentionRepositoryMock: any;

  const mockIntention = {
    id: 1,
    full_name: 'Test User',
    email: 'test@test.com',
    phone: '1234567890',
    company: 'Test Company',
    position: 'Test Position',
    group_id: 1,
    status: 'pending',
    token: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    intentionRepositoryMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByToken: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntentiosService,
        {
          provide: 'IntentionRepository',
          useValue: intentionRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<IntentiosService>(IntentiosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an intention', async () => {
      const createIntentionDto = {
        full_name: 'Test User',
        email: 'test@test.com',
        phone: '1234567890',
        company: 'Test Company',
        position: 'Test Position',
        group_id: 1,
      };

      intentionRepositoryMock.create.mockResolvedValue(mockIntention);

      const result = await service.create(createIntentionDto);

      expect(result).toEqual(mockIntention);
      expect(intentionRepositoryMock.create).toHaveBeenCalledWith(createIntentionDto);
    });
  });

  describe('findAll', () => {
    it('should return all intentions for admin', async () => {
      intentionRepositoryMock.findAll.mockResolvedValue([mockIntention]);

      const result = await service.findAll(undefined, true);

      expect(result).toEqual([mockIntention]);
      expect(intentionRepositoryMock.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return intentions for specific group', async () => {
      intentionRepositoryMock.findAll.mockResolvedValue([mockIntention]);

      const result = await service.findAll(1, false);

      expect(result).toEqual([mockIntention]);
      expect(intentionRepositoryMock.findAll).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException for non-admin without groupId', async () => {
      await expect(service.findAll(undefined, false)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an intention', async () => {
      intentionRepositoryMock.findOne.mockResolvedValue(mockIntention);

      const result = await service.findOne(1);

      expect(result).toEqual(mockIntention);
      expect(intentionRepositoryMock.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when intention not found', async () => {
      intentionRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByToken', () => {
    it('should return an intention by token', async () => {
      intentionRepositoryMock.findByToken.mockResolvedValue(mockIntention);

      const result = await service.findByToken('test-token');

      expect(result).toEqual(mockIntention);
      expect(intentionRepositoryMock.findByToken).toHaveBeenCalledWith('test-token');
    });

    it('should throw NotFoundException when token is invalid', async () => {
      intentionRepositoryMock.findByToken.mockResolvedValue(null);

      await expect(service.findByToken('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('approve', () => {
    it('should approve an intention and generate token', async () => {
      const mockToken = 'generated-token';
      (crypto.randomBytes as jest.Mock).mockReturnValue({
        toString: () => mockToken,
      });

      intentionRepositoryMock.findOne.mockResolvedValue(mockIntention);
      intentionRepositoryMock.update.mockResolvedValue({
        ...mockIntention,
        status: 'approved',
        token: mockToken,
      });

      const result = await service.approve(1);

      expect(result.status).toBe('approved');
      expect(result.token).toBe(mockToken);
      expect(intentionRepositoryMock.update).toHaveBeenCalledWith(1, {
        status: 'approved',
        token: mockToken,
      });
    });

    it('should throw NotFoundException when intention not found', async () => {
      intentionRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.approve(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reject', () => {
    it('should reject an intention', async () => {
      intentionRepositoryMock.findOne.mockResolvedValue(mockIntention);
      intentionRepositoryMock.update.mockResolvedValue({
        ...mockIntention,
        status: 'rejected',
      });

      const result = await service.reject(1);

      expect(result.status).toBe('rejected');
      expect(intentionRepositoryMock.update).toHaveBeenCalledWith(1, {
        status: 'rejected',
      });
    });

    it('should throw NotFoundException when intention not found', async () => {
      intentionRepositoryMock.findOne.mockResolvedValue(null);

      await expect(service.reject(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an intention', async () => {
      const updateIntentionDto = {
        full_name: 'Updated User',
        email: 'updated@test.com',
      };

      intentionRepositoryMock.update.mockResolvedValue({
        ...mockIntention,
        ...updateIntentionDto,
      });

      const result = await service.update(1, updateIntentionDto);

      expect(result.full_name).toBe('Updated User');
      expect(result.email).toBe('updated@test.com');
      expect(intentionRepositoryMock.update).toHaveBeenCalledWith(
        1,
        updateIntentionDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove an intention', async () => {
      await service.remove(1);

      expect(intentionRepositoryMock.delete).toHaveBeenCalledWith(1);
    });
  });
});
