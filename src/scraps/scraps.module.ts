import { Module } from '@nestjs/common';
import { ScrapController } from './scraps.controller';
import { ScrapService } from './scraps.service';

@Module({
  controllers: [ScrapController],
  providers: [ScrapService],
})
export class ScrapModule {}
