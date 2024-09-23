import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { EReportReason, EReportStatus } from "../enum";

export class BaseReportedDto {
    @IsNotEmpty()
    @ApiProperty({ description: '신고한 사용자 ID', example: 2 })
    userId: number;
  
    @IsNotEmpty()
    @ApiProperty({ description: '신고된 사용자 ID', example: 3 })
    reportedUserId: number;
  
    @IsNotEmpty()
    @ApiProperty({ description: '신고 사유', enum: EReportReason })
    reportedReason: EReportReason;
  
    @IsNotEmpty()
    @ApiProperty({ description: '기타 신고 사유 (other인 경우에 사유를 써야됨.)', nullable: true })
    otherReportedReason: string | null;
  
    @IsNotEmpty()
    @ApiProperty({ description: '신고 처리 상태', enum: EReportStatus })
    status: EReportStatus;
  }