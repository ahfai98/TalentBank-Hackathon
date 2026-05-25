import { Test, TestingModule } from '@nestjs/testing';
import { UpskillingService } from './upskilling.service';

describe('UpskillingService', () => {
  let service: UpskillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpskillingService],
    }).compile();

    service = module.get<UpskillingService>(UpskillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
