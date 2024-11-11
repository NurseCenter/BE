import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindOneOptions, Repository } from 'typeorm';
import { CommentsEntity } from './entities/comments.entity';
import { EBoardType } from 'src/posts/enum/board-type.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { summarizeContent } from 'src/common/utils/summarize.utils';
import { ESearchCommentByAdmin } from 'src/admin/enums';

@Injectable()
export class CommentsDAO {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
  ) {}

  // 댓글 ID로 댓글 조회
  async findCommentById(
    commentId: number,
    options?: FindOneOptions<CommentsEntity>,
  ): Promise<CommentsEntity | undefined> {
    return await this.commentsRepository.findOne({
      where: {
        commentId,
        deletedAt: null,
      },
      ...options,
    });
  }

  // 댓글 ID로 댓글 찾기 (삭제된 댓글 포함)
  async findCommentByIdWithDeletedComment(commentId: number): Promise<CommentsEntity | undefined> {
    return await this.commentsRepository.findOne({
      where: { commentId },
    });
  }

  // 댓글 ID로 댓글 내용 조회 (100자 이상이면 축약)
  async findCommentContentByCommentId(commentId: number): Promise<string> {
    const { content } = await this.commentsRepository.findOne({
      where: { commentId },
    });

    const summaryContent = summarizeContent(content);

    return summaryContent;
  }

  // 댓글 생성
  async createComment(
    createCommentDto: CreateCommentDto,
    userId: number,
    postId: number,
    boardType: EBoardType,
  ): Promise<CommentsEntity> {
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      userId,
      postId,
      boardType,
    });
    return comment;
  }

  // 댓글 수정
  async updateComment(commentId: number, createCommentDto: CreateCommentDto): Promise<void> {
    await this.commentsRepository.update(commentId, {
      ...createCommentDto,
    });
  }

  // 특정 게시물의 모든 댓글 조회
  async findCommentsInOnePost(postId: number): Promise<any[]> {
    // 모든 댓글 조회
    const comments = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .select([
        'comment.commentId AS commentId',
        'comment.content AS content',
        'comment.postId AS postId',
        'comment.boardType AS boardType',
        'comment.createdAt AS createdAt',
        'comment.updatedAt AS updatedAt',
        'comment.deletedAt AS deletedAt',
        'user.userId AS userId',
        'user.nickname AS nickname',
      ])
      .where('comment.postId = :postId', { postId })
      .orderBy('comment.createdAt', 'ASC')
      .getRawMany();

    return comments;
  }

  // 특정 게시물의 모든 댓글 조회
  async findCommentsInOnePostWithoutDeleted(postId: number): Promise<any[]> {
    // 모든 댓글 조회
    const comments = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .select([
        'comment.commentId AS commentId',
        'comment.content AS content',
        'comment.postId AS postId',
        'comment.boardType AS boardType',
        'comment.createdAt AS createdAt',
        'comment.updatedAt AS updatedAt',
        'comment.deletedAt AS deletedAt',
        'user.userId AS userId',
        'user.nickname AS nickname',
      ])
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.deletedAt IS NULL')
      .orderBy('comment.createdAt', 'ASC')
      .getRawMany();

    return comments;
  }

  // 댓글 삭제
  async deleteComment(commentId: number): Promise<DeleteResult> {
    const comment = await this.findCommentByIdWithDeletedComment(commentId);
    comment.deletedAt = new Date();
    await this.commentsRepository.save(comment);
    return { affected: 1, raw: {} };
  }

  // 여러 댓글 삭제
  async deleteComments(commentIds: number[]): Promise<{ affected: number; alreadyDeletedIds: number[] }> {
    let affectedCount = 0;
    const alreadyDeletedIds: number[] = [];

    for (const commentId of commentIds) {
      const comment = await this.commentsRepository.findOne({ where: { commentId } });

      // 본 API 요청 전 이미 삭제된 상태의 댓글을 저장
      if (!comment || comment.deletedAt) {
        alreadyDeletedIds.push(commentId);
        continue;
      }

      comment.deletedAt = new Date();
      await this.commentsRepository.save(comment);
      affectedCount++;
    }

    return { affected: affectedCount, alreadyDeletedIds };
  }

  // 댓글 저장
  async saveComment(comment: CommentsEntity): Promise<CommentsEntity> {
    return this.commentsRepository.save(comment);
  }

  // 특정 회원이 쓴 댓글 조회
  async findCommentsByUserIdWithPagination(
    userId: number,
    skip: number,
    take: number,
  ): Promise<[CommentsEntity[], number]> {
    const [comments, count] = await this.commentsRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.post', 'post')
      .where('comment.userId = :userId', { userId })
      .andWhere('comment.deletedAt IS NULL')
      .andWhere('post.deletedAt IS NULL') // 삭제되지 않은 게시물의 댓글만 조회
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return [comments, count];
  }

  // 관리자 모든 댓글 조회
  async findAllComments(type: ESearchCommentByAdmin, search: string): Promise<any[]> {
    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.user', 'commentUser') // 댓글 작성자
      .select([
        'comment.commentId', // 댓글 ID (렌더링 X)
        'comment.content', // 댓글 내용
        'comment.createdAt', // 작성일
        'commentUser.nickname', // 작성자 닉네임,
        'post.postId', // 원 게시물 ID
        'post.title', // 게시물 제목
        'post.boardType', // 게시물 카테고리
      ])
      .where('comment.deletedAt IS NULL');

    if (type && search) {
      switch (type) {
        case ESearchCommentByAdmin.COMMENT_ID:
          queryBuilder.andWhere('comment.commentId = :search', { search });
          break;
        case ESearchCommentByAdmin.COMMENT_CONTENT:
          queryBuilder.andWhere('comment.content LIKE :search', { search: `%${search}%` });
          break;
        case ESearchCommentByAdmin.COMMENT_AUTHOR:
          queryBuilder.andWhere('commentUser.nickname LIKE :search', { search: `%${search}%` });
          break;
        case ESearchCommentByAdmin.POST_TITLE:
          queryBuilder.andWhere('post.title LIKE :search', { search: `%${search}%` });
          break;
      }
    }

    const results = await queryBuilder.getMany();
    return results;
  }

  // 관리자 특정 댓글 조회
  async findCommentByIdByAdmin(id: number): Promise<any> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'commentUser') // 댓글 작성자
      .leftJoinAndSelect('comment.post', 'post')
      .select([
        'comment.commentId', // 댓글 ID
        'comment.content', // 댓글 내용
        'comment.createdAt', // 작성일
        'commentUser.nickname', // 작성자 닉네임
        'post.postId', // 게시물 ID
        'post.title', // 게시물 제목
        'post.boardType', // 게시물 카테고리
      ])
      .where('comment.commentId = :id AND comment.deletedAt IS NULL', { id })
      .getRawOne();
  }

  // 특정 게시물에 달린 댓글 수 구하기
  async countAllCommentsByPostId(postId: number): Promise<number> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.deletedAt IS NULL')
      .getCount();
  }
}
