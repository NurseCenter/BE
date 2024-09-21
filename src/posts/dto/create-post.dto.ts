import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';

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
  @IsOptional()
  @IsString({ each: true })
  @ApiProperty({ type: [String], description: '파일 타입 배열' })
  imageTypes?: string[];

  @IsOptional()
  @ApiProperty({ type: [String], description: '게시물과 관련된 병원 이름 배열' })
  hospitalNames?: string[];
}
