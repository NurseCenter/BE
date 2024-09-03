import { IsOptional, IsString, Length } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto {
  @IsOptional()
  @Length(1, 50)
  @IsString()
  title?: string;

  @IsOptional()
  @Length(1, 2000)
  @IsString()
  content?: string;
}
