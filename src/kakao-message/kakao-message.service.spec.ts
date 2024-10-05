import { Test, TestingModule } from '@nestjs/testing';
import { KakaoMessageService } from './kakao-message.service';

describe('KakaoMessageService', () => {
  let service: KakaoMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KakaoMessageService],
    }).compile();

    service = module.get<KakaoMessageService>(KakaoMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
