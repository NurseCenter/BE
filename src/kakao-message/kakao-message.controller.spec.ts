import { Test, TestingModule } from '@nestjs/testing';
import { KakaoMessageController } from './kakao-message.controller';

describe('KakaoMessageController', () => {
  let controller: KakaoMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KakaoMessageController],
    }).compile();

    controller = module.get<KakaoMessageController>(KakaoMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
