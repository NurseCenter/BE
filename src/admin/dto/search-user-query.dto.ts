import { IsEnum, IsOptional } from 'class-validator';
import { ESearchUser } from '../enums';
import { SearchQueryDto } from 'src/common/dto';
import { ApiProperty } from '@nestjs/swagger';

export class SearchUserQueryDto extends SearchQueryDto {
  @ApiProperty({
    description: '관리자 페이지 회원 검색 타입',
    enumName: 'ESearchUser',
    required: false,
    enum: [
      { value: ESearchUser.USER_ID, description: '회원 ID로 검색' },
      { value: ESearchUser.NICKNAME, description: '닉네임으로 검색' },
      { value: ESearchUser.EMAIL, description: '이메일로 검색' },
    ],
  })
  @IsEnum(ESearchUser)
  @IsOptional()
  type?: ESearchUser;
}
