import { IsArray, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EBoardType } from '../enum/board-type.enum';

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

  @IsArray()
  @IsOptional()
  @ApiProperty({ type: [String], description: '파일 URL들이 담긴 배열' })
  fileUrls?: string[];

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [String], description: '게시물과 관련된 병원 이름 배열' })
  hospitalNames?: string[];
}
