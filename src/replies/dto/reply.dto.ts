import { IsString, Length } from 'class-validator';

export class ReplyDto {
  @Length(1, 1000)
  @IsString()
  content: string;
}
