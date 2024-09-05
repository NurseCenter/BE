import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @IsOptional()
  @Length(1, 50)
  @IsString()
  @ApiProperty({ description: '게시글 제목', required: false })
  title?: string;

  @IsOptional()
  @Length(1, 2000)
  @IsString()
  @ApiProperty({ description: '게시글 내용', required: false })
  content?: string;
}
