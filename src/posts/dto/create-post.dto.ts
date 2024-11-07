import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Length } from 'class-validator';
import { BasePostDto } from './base-post.dto';
import { IFileUrls } from 'src/files/interfaces/file-urls.interface';

export class CreatePostDto extends OmitType(BasePostDto, ['postId', 'boardType'] as const) {
  @Length(1, 50)
  @IsString()
  @ApiProperty({ description: '게시글 제목' })
  title: string;

  @IsString()
  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @IsOptional()
  @ApiProperty({
    type: `IFileUrls`,
    description: 'images(본문에 넣은 이미지 파일 배열), attachments(첨부파일로 넣은 여러 가지 파일들)',
  })
  fileUrls?: IFileUrls;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String], description: '게시물과 관련된 병원 이름 배열' })
  hospitalNames?: string[];
}
