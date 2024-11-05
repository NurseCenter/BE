import { IAttachments } from './attachments.interface';

export interface IFileUrls {
  images: string[]; // 에디터 본문에 첨부된 이미지 파일
  attachments: IAttachments[]; // 첨부파일
}
