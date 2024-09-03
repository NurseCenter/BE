import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, Length } from 'class-validator';

export class CreatePostDto {
  @Length(1, 50)
  @IsString()
  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @Length(1, 2000)
  @IsString()
  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: '이미지 타입 배열' })
  imageTypes?: string[];
}
