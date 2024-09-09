import { Module } from '@nestjs/common';
import { UsersDAO } from 'src/users/users.dao';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { ImagesModule } from 'src/images/images.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from 'src/users/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity]), ImagesModule],
  providers: [CertificatesService, UsersDAO],
  controllers: [CertificatesController],
  exports: [CertificatesModule],
})
export class CertificatesModule {}
