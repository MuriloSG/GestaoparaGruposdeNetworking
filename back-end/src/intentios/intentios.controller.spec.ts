import { Test, TestingModule } from '@nestjs/testing';
import { IntentiosController } from './intentios.controller';
import { IntentiosService } from './intentios.service';

describe('IntentiosController', () => {
  let controller: IntentiosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntentiosController],
      providers: [IntentiosService],
    }).compile();

    controller = module.get<IntentiosController>(IntentiosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
