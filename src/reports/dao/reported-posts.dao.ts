import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ReportPostsEntity } from '../entities/report-posts.entity';
import { EReportStatus } from '../enum';
import { IPaginatedResponse } from 'src/common/interfaces';
import { UsersDAO } from 'src/users/users.dao';

@Injectable()
export class ReportedPostsDAO {
  constructor(
    @InjectRepository(ReportPostsEntity)
    private readonly reportPostsRepository: Repository<ReportPostsEntity>,
    private readonly usersDAO: UsersDAO
  ) {}

  // 게시물 신고 엔티티 생성
  async createPostReport(data: Partial<ReportPostsEntity>) {
    const reportedPost = this.reportPostsRepository.create(data);
    return reportedPost;
  }

  // 신고된 게시물 테이블 고유 ID로 신고된 특정 게시물 조회
  async findReportedPostByReportId(reportPostId: number) {
    return this.reportPostsRepository.findOne({
      where: { reportPostId },
    });
  }

  // 게시물 ID로 신고된 특정 게시물 조회
  async findReportedPostByPostId(postId: number): Promise<IFormattedReportedPostResponse> {
    const reportedPost = await this.reportPostsRepository.findOne({
      where: { 
        postId,
        posts: {
          deletedAt: null
        }
       },
      relations: ['posts', 'posts.user'],
    });

    const reporterId = reportedPost.userId; // 신고자 회원 ID
    const reporterNickname = await this.usersDAO.findUserNicknameByUserId(reporterId);

    const formattedPost = {
      postAuthor: reportedPost.posts.user.nickname, // 작성자
      postDate: reportedPost.posts.createdAt, // 작성일자 (원 게시물)
      postCategory: reportedPost.posts.boardType, // 카테고리
      postId: reportedPost.posts.postId, // 원 게시물 ID
      postTitle: reportedPost.posts.title, // 게시물 제목
      reporter: reporterNickname, // 신고자 닉네임
      reportDate: reportedPost.createdAt, // 신고날짜
      reportId: reportedPost.reportPostId, // 신고 테이블에서의 고유 ID
      reportedReason: reportedPost.reportedReason, // 신고 사우
      otherReportedReason: reportedPost.otherReportedReason // 기타 신고 사유
    }
    
    return formattedPost;
  }

  // 게시물 ID와 회원 ID로 신고된 특정 게시물 조회
  async findReportedPostByPostIdAndUserId(postId: number, userId: number) {
    return this.reportPostsRepository.findOne({
      where: { postId, userId },
    });
  }

  // 이미 신고된 게시글 유무 파악
  async existsReportedPost(postId: number, userId: number): Promise<boolean> {
    const count = await this.reportPostsRepository.count({
      where: { postId, userId },
    });

    return count > 0 ? true : false;
  }

  // 신고된 모든 게시물 조회
  async findAllReportedPosts(page: number, limit: number): Promise<IPaginatedResponse<any>> {
    const skip = (page - 1) * limit;

    const [items, total] = await this.reportPostsRepository.findAndCount({
        skip,
        take: limit,
        relations: ['posts', 'posts.user'], 
        where: {
            posts: {
                deletedAt: null,
            },
        },
        order: {
          createdAt: 'DESC' // 기본: 신고일자 기준 내림차순
        }
    });

    const formattedItems = items.map(reportPost => ({
        reportId: reportPost.reportPostId, // 신고된 게시물 ID (신고 테이블에서의 ID)
        postId: reportPost.posts.postId, // 게시물 ID (게시물 테이블에서의 ID)
        postCategory: reportPost.posts.boardType, // 게시물 카테고리
        postTitle: reportPost.posts.title, // 게시물 제목
        postAuthor: reportPost.posts.user.nickname, // 게시물 작성자
        reportDate: reportPost.createdAt, // 신고일자
        reporter: reportPost.reportingUser, // 신고자
        reportReason: reportPost.reportedReason, // 신고 사유
        status: reportPost.status, // 처리 상태
    }));

    return {
        items: formattedItems,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
    };
}

  // 신고된 특정 게시물 조회
  async findReportedPost(postId: number): Promise<any> {
    return await this.reportPostsRepository
      .createQueryBuilder('reportPost')
      .leftJoinAndSelect('reportPost.posts', 'post')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.postId = :postId', { postId })
      .select([
        'user.nickname AS postAuthor', // 게시물 작성자
        'post.createdAt AS postDate', // 게시물 작성일자
        'post.boardType AS postCategory', // 게시물 카테고리
        'post.postId As postId', // 게시물 ID (게시물 테이블에서의 ID)
        'post.title AS postTitle', // 게시물 제목
        'reportPost.reportingUser AS reporter', // 신고자
        'reportPost.createdAt AS reportDate', // 신고날짜
        'reportPost.reportPostId AS reportId', // 신고된 게시물 ID (신고 테이블에서의 ID) (렌더링 X)
        'reportPost.reportedReason AS reportReason', // 신고 사유
      ])
      .getRawOne();
  }

  // 신고된 특정 게시물 삭제
  async removeReportedPost(postId: number): Promise<DeleteResult> {
    return await this.reportPostsRepository.softDelete({ postId });
  }

  // 신고된 게시물 상태 업데이트
  async updateReportedPostStatus(reportId: number, status: EReportStatus): Promise<void> {
    await this.reportPostsRepository.update(reportId, { status });
  }

  // 신고된 게시물 저장
  async saveReportPost(reportPost: ReportPostsEntity): Promise<ReportPostsEntity> {
    return await this.reportPostsRepository.save(reportPost);
  }
}
