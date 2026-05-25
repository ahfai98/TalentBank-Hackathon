import { Test, TestingModule } from '@nestjs/testing';
import { UpskillingController } from './upskilling.controller';

describe('UpskillingController', () => {
  let controller: UpskillingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpskillingController],
    }).compile();

    controller = module.get<UpskillingController>(UpskillingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
