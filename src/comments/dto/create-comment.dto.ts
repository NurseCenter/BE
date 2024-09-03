import { IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @Length(1, 1000)
  @IsString()
  content: string;
}
