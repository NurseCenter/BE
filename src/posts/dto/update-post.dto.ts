import { IsArray, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EBoardType } from '../enum/board-type.enum';
import { IFileUrls } from 'src/files/interfaces/file-urls.interface';

export class UpdatePostDto {
  @IsOptional()
  @Length(1, 50)
  @IsString()
  @ApiProperty({ description: '게시글 제목', required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: '게시글 내용', required: false })
  content?: string;

  @IsOptional()
  @IsEnum(EBoardType)
  @ApiProperty({ description: '변경 후 게시판 카테고리', required: false })
  afterBoardType?: EBoardType;

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
