import { EStudentStatus } from 'src/users/enums';
import { IsEnum, IsString, Matches } from 'class-validator';
import { validationMessages } from '../interfaces/validation-messages';
import { NICKNAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX } from './index';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '닉네임 - 한글 또는 영문 2~8자 (숫자 및 특수문자 불가)',
    example: '명란젓코난',
  })
  @IsString()
  @Matches(NICKNAME_REGEX, { message: validationMessages.nickname })
  readonly nickname: string;

  @ApiProperty({
    description: '이름 - 졸업증명서 및 재학증명서에서 추출한 회원의 실명',
    example: '김개똥',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    description: '이메일 - 이메일 정규식',
    example: 'john.doe@example.com',
  })
  @IsString()
  @Matches(EMAIL_REGEX, { message: validationMessages.email })
  readonly email: string;

  @ApiProperty({
    description:
      "비밀번호 - 8 ~ 16자, 영문 대문자, 소문자, 숫자, 특수문자 각각 1개 이상 포함 (특수문자는 '!@#$%^&*?_'만 가능)",
    example: 'P@ssw0rd123',
  })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: validationMessages.password })
  readonly password: string;

  @ApiProperty({
    description: '전화번호',
    example: '01012345678',
  })
  @IsString()
  readonly phoneNumber: string;

  @ApiProperty({
    description: '졸업생/재학생 여부',
    enum: EStudentStatus,
    example: EStudentStatus.CURRENT,
  })
  @IsEnum(EStudentStatus, { message: validationMessages.studentStatus })
  readonly status: EStudentStatus;

  @ApiProperty({
    description: '인증서류 링크 (S3 버킷 링크 형식)',
    example: 'https://s3.amazonaws.com/my-bucket/certification-docs/johndoe-cert.pdf',
  })
  @IsString()
  readonly certificationDocumentUrl: string;
}
