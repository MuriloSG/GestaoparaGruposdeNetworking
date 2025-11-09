import { Test, TestingModule } from '@nestjs/testing';
import { IntentiosService } from './intentios.service';

describe('IntentiosService', () => {
  let service: IntentiosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntentiosService],
    }).compile();

    service = module.get<IntentiosService>(IntentiosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
