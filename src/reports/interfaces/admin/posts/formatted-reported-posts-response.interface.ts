import { EReportStatus } from 'src/reports/enum';
import { IBaseFormattedReportedPostResponse } from './base-formatted-reported-posts-response.interface';

export interface IFormattedReportedPostsResponse extends IBaseFormattedReportedPostResponse {
  status: EReportStatus; // 처리 상태
}
