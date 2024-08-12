import { Test, TestingModule } from '@nestjs/testing';
import { ScrapService } from './scrap.service';

describe('ScrapService', () => {
  let service: ScrapService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScrapService],
    }).compile();

    service = module.get<ScrapService>(ScrapService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
