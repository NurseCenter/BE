import { IsString, Length } from 'class-validator';

export class CreatePostDto {
  @Length(1, 50)
  @IsString()
  title: string;

  @Length(1, 2000)
  @IsString()
  content: string;
}
