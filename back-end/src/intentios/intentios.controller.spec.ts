import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { IntentiosController } from './intentios.controller';
import { IntentiosService } from './intentios.service';
import { CreateIntentioDto } from './dto/create-intentio.dto';
import { UpdateIntentioDto } from './dto/update-intentio.dto';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('IntentiosController', () => {
  let controller: IntentiosController;
  let intentiosServiceMock: any;

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

  const mockUser = {
    sub: 1,
    email: 'admin@test.com',
    is_admin: true,
  };

  beforeEach(async () => {
    intentiosServiceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByToken: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const jwtServiceMock = {
      verifyAsync: jest.fn().mockResolvedValue({ is_admin: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntentiosController],
      providers: [
        {
          provide: IntentiosService,
          useValue: intentiosServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: AdminGuard,
          useValue: { canActivate: jest.fn().mockImplementation(() => true) },
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn().mockImplementation(() => true) },
        },
      ],
    })
    .overrideGuard(AdminGuard)
    .useValue({ canActivate: jest.fn().mockImplementation(() => true) })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn().mockImplementation(() => true) })
    .compile();

    controller = module.get<IntentiosController>(IntentiosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an intention', async () => {
      const createIntentionDto: CreateIntentioDto = {
        full_name: 'Test User',
        email: 'test@test.com',
        phone: '1234567890',
        company: 'Test Company',
        position: 'Test Position',
        group_id: 1,
      };

      intentiosServiceMock.create.mockResolvedValue(mockIntention);

      const result = await controller.create(createIntentionDto);

      expect(result).toEqual(mockIntention);
      expect(intentiosServiceMock.create).toHaveBeenCalledWith(createIntentionDto);
    });
  });

  describe('findAll', () => {
    it('should return all intentions for admin', async () => {
      intentiosServiceMock.findAll.mockResolvedValue([mockIntention]);

      const result = await controller.findAll(undefined, mockUser);

      expect(result).toEqual([mockIntention]);
      expect(intentiosServiceMock.findAll).toHaveBeenCalledWith(undefined, true);
    });

    it('should return intentions for specific group', async () => {
      intentiosServiceMock.findAll.mockResolvedValue([mockIntention]);

      const result = await controller.findAll('1', { ...mockUser, is_admin: false });

      expect(result).toEqual([mockIntention]);
      expect(intentiosServiceMock.findAll).toHaveBeenCalledWith(1, false);
    });
  });

  describe('findByToken', () => {
    it('should return an intention by token', async () => {
      intentiosServiceMock.findByToken.mockResolvedValue(mockIntention);

      const result = await controller.findByToken('test-token');

      expect(result).toEqual(mockIntention);
      expect(intentiosServiceMock.findByToken).toHaveBeenCalledWith('test-token');
    });
  });

  describe('findOne', () => {
    it('should return an intention', async () => {
      intentiosServiceMock.findOne.mockResolvedValue(mockIntention);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockIntention);
      expect(intentiosServiceMock.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('approve', () => {
    it('should approve an intention', async () => {
      const approvedIntention = { ...mockIntention, status: 'approved', token: 'test-token' };
      intentiosServiceMock.approve.mockResolvedValue(approvedIntention);

      const result = await controller.approve('1');

      expect(result).toEqual(approvedIntention);
      expect(intentiosServiceMock.approve).toHaveBeenCalledWith(1);
    });
  });

  describe('reject', () => {
    it('should reject an intention', async () => {
      const rejectedIntention = { ...mockIntention, status: 'rejected' };
      intentiosServiceMock.reject.mockResolvedValue(rejectedIntention);

      const result = await controller.reject('1');

      expect(result).toEqual(rejectedIntention);
      expect(intentiosServiceMock.reject).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an intention', async () => {
      const updateIntentionDto: UpdateIntentioDto = {
        full_name: 'Updated User',
        email: 'updated@test.com',
      };

      const updatedIntention = { ...mockIntention, ...updateIntentionDto };
      intentiosServiceMock.update.mockResolvedValue(updatedIntention);

      const result = await controller.update('1', updateIntentionDto);

      expect(result).toEqual(updatedIntention);
      expect(intentiosServiceMock.update).toHaveBeenCalledWith(1, updateIntentionDto);
    });
  });

  describe('remove', () => {
    it('should remove an intention', async () => {
      await controller.remove('1');

      expect(intentiosServiceMock.remove).toHaveBeenCalledWith(1);
    });
  });
});
