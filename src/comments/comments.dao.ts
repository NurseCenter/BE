import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { DeleteResult, FindOneOptions, Repository } from 'typeorm';
import { CommentsEntity } from './entities/comments.entity';
import { EBoardType } from 'src/posts/enum/board-type.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentWithRepliesDto } from './dto/comment-with-replies.dto';
import { summarizeContent } from 'src/common/utils/summarize.utils';

@Injectable()
export class CommentsDAO {
  constructor(
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
    @InjectRepository(RepliesEntity)
    private readonly repliesRepository: Repository<RepliesEntity>,
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

  // // 특정 게시물의 모든 댓글 조회 (각 댓글의 답글 포함)
  // async findCommentsWithReplies(
  //   postId: number,
  //   page: number,
  //   limit: number,
  // ): Promise<{ comments: CommentWithRepliesDto[]; total: number }> {
  //   const skip = (page - 1) * limit;

  //   // 댓글 조회
  //   const comments = await this.commentsRepository
  //     .createQueryBuilder('comment')
  //     .leftJoinAndSelect('comment.user', 'user')
  //     .where('comment.postId = :postId AND comment.deletedAt IS NULL', { postId })
  //     .select([
  //       'comment.commentId AS commentId',
  //       'comment.content AS content',
  //       'comment.postId AS postId',
  //       'comment.boardType AS boardType',
  //       'comment.createdAt AS createdAt',
  //       'comment.updatedAt AS updatedAt',
  //       'user.userId AS userId',
  //       'user.nickname AS nickname',
  //     ])
  //     .orderBy('comment.createdAt', 'ASC')
  //     .skip(skip)
  //     .take(limit)
  //     .getRawMany();

  //   // 총 댓글 수 조회
  //   const total = await this.commentsRepository.count({
  //     where: {
  //       postId,
  //       deletedAt: null,
  //     },
  //   });

  //   // 댓글과 각 댓글에 대한 답글 조회
  //   const commentsWithReplies: CommentWithRepliesDto[] = await Promise.all(
  //     comments.map(async (comment) => {
  //       const replies = await this.repliesRepository
  //         .createQueryBuilder('reply')
  //         .leftJoinAndSelect('reply.user', 'user')
  //         .where('reply.commentId = :commentId AND reply.deletedAt IS NULL', { commentId: comment.commentId })
  //         .select([
  //           'reply.replyId AS replyId',
  //           'reply.content AS content',
  //           'reply.createdAt AS createdAt',
  //           'reply.updatedAt AS updatedAt',
  //           'user.userId AS userId',
  //           'user.nickname AS nickname',
  //         ])
  //         .orderBy('reply.createdAt', 'ASC')
  //         .getRawMany();

  //       return {
  //         commentId: comment.commentId,
  //         content: comment.content,
  //         postId: comment.postId,
  //         boardType: comment.boardType,
  //         createdAt: comment.createdAt,
  //         updatedAt: comment.updatedAt,
  //         userId: comment.userId,
  //         nickname: comment.nickname,
  //         replies: replies.map((reply) => ({
  //           replyId: reply.replyId,
  //           content: reply.content,
  //           createdAt: reply.createdAt,
  //           updatedAt: reply.updatedAt,
  //           userId: reply.userId,
  //           nickname: reply.nickname,
  //         })),
  //       };
  //     }),
  //   );

  //   return { comments: commentsWithReplies, total };
  // }

  // 특정 게시물의 모든 댓글 조회 (각 댓글의 답글 포함)
  async findCommentsWithReplies(postId: number, page: number, limit: number) {
    // 모든 댓글 조회
    const comments = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.postId = :postId AND comment.deletedAt IS NULL', { postId })
      .select([
        'comment.commentId AS commentId',
        'comment.content AS content',
        'comment.postId AS postId',
        'comment.boardType AS boardType',
        'comment.createdAt AS createdAt',
        'comment.updatedAt AS updatedAt',
        'user.userId AS userId',
        'user.nickname AS nickname',
      ])
      .orderBy('comment.createdAt', 'ASC')
      .getRawMany();

    // 전체 댓글 수
    const total = comments.length;

    // 페이지네이션 적용
    const skip = (page - 1) * limit;
    const paginatedComments = comments.slice(skip, skip + limit);

    // 댓글과 각 댓글에 대한 답글 조회
    const commentsWithReplies: CommentWithRepliesDto[] = await Promise.all(
      paginatedComments.map(async (comment) => {
        const replies = await this.repliesRepository
          .createQueryBuilder('reply')
          .leftJoinAndSelect('reply.user', 'user')
          .where('reply.commentId = :commentId AND reply.deletedAt IS NULL', { commentId: comment.commentId })
          .select([
            'reply.replyId AS replyId',
            'reply.content AS content',
            'reply.createdAt AS createdAt',
            'reply.updatedAt AS updatedAt',
            'user.userId AS userId',
            'user.nickname AS nickname',
          ])
          .orderBy('reply.createdAt', 'ASC')
          .getRawMany();

        return {
          commentId: comment.commentId,
          content: comment.content,
          postId: comment.postId,
          boardType: comment.boardType,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          userId: comment.userId,
          nickname: comment.nickname,
          replies: replies.map((reply) => ({
            replyId: reply.replyId,
            content: reply.content,
            createdAt: reply.createdAt,
            updatedAt: reply.updatedAt,
            userId: reply.userId,
            nickname: reply.nickname,
          })),
        };
      }),
    );

    // 총 페이지 수 계산
    const totalPages = Math.ceil(total / limit);

    return {
      comments: commentsWithReplies,
      total,
      totalPages,
      currentPage: page,
    };
  }

  // 특정 게시물의 모든 댓글 조회
  async findCommentsInOnePost(
    boardType: EBoardType,
    postId: number,
    page: number,
    limit: number,
  ): Promise<{
    items: CommentsEntity[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    // 모든 댓글 조회
    const allComments = await this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .select([
        'comment.commentId AS commentId',
        'comment.content AS content',
        'comment.postId AS postId',
        'comment.boardType AS boardType',
        'comment.createdAt AS createdAt',
        'comment.updatedAt AS updatedAt',
        'user.userId AS userId',
        'user.nickname AS nickname',
      ])
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.boardType = :boardType', { boardType })
      .andWhere('comment.deletedAt IS NULL')
      .orderBy('comment.createdAt', 'ASC')
      .getRawMany();

    // 전체 댓글 수
    const total = allComments.length;

    // 페이지네이션 적용
    const skip = (page - 1) * limit;
    const paginatedComments = allComments.slice(skip, skip + limit);

    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedComments,
      totalItems: total,
      totalPages,
      currentPage: page,
    };
  }

  // 댓글 삭제
  async deleteComment(commentId: number): Promise<DeleteResult> {
    return this.commentsRepository.softDelete(commentId);
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
      .where('comment.userId = :userId', { userId })
      .andWhere('comment.deletedAt IS NULL')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return [comments, count];
  }

  // 관리자 모든 댓글 조회
  async findAllComments(): Promise<any[]> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .select([
        'comment.commentId', // 댓글 ID (렌더링 X)
        'comment.content', // 댓글 내용
        'comment.createdAt', // 작성일
        'user.nickname', // 작성자 닉네임,
        'post.title', // 게시물 제목
        'post.boardType', // 게시물 카테고리
      ])
      .where('comment.deletedAt IS NULL')
      .andWhere('post.deletedAt IS NULL') // 원 게시물이 삭제되었으면 해당 댓글도 안 나오게 함.
      .getMany();
  }

  // 관리자 특정 댓글 조회
  async findCommentByIdByAdmin(id: number): Promise<any> {
    return this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .select([
        'comment.commentId', // 댓글 ID
        'comment.content', // 댓글 내용
        'comment.createdAt', // 작성일
        'user.nickname', // 작성자 닉네임
        'post.title', // 게시물 제목
        'post.boardType', // 게시물 카테고리
      ])
      .where('comment.commentId = :id AND comment.deletedAt IS NULL', { id })
      .getRawOne();
  }

  // 특정 게시물에 달린 댓글 수 구하기
  async countAllCommentsByPostId(postId: number): Promise<number> {
    return this.commentsRepository.count({ where: { postId, deletedAt: null } });
  }
}
