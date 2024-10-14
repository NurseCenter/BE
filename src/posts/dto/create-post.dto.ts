import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';
import { BasePostDto } from './base-post.dto';

export class CreatePostDto extends OmitType(BasePostDto, ['postId', 'boardType'] as const) {
  @Length(1, 50)
  @IsString()
  @ApiProperty({ description: '게시글 제목' })
  title: string;

  // @Length(1, 2000)
  @IsString()
  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [String], description: '파일 URL들이 담긴 배열' })
  fileUrls?: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String], description: '게시물과 관련된 병원 이름 배열' })
  hospitalNames?: string[];
}
