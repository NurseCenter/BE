import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { DeleteResult, FindOneOptions, Repository } from 'typeorm';
import { CommentsEntity } from './entities/comments.entity';
import { EBoardType } from 'src/posts/enum/board-type.enum';
import { CreateCommentDto } from './dto/create-comment.dto';

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

    const summaryContent = content.length > 100 ? content.substring(0, 100) + '...' : content;

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
  async findCommentsInOnePost(
    boardType: EBoardType,
    postId: number,
    page: number,
    limit: number,
  ): Promise<{ comments: CommentsEntity[]; total: number }> {
    const skip = (page - 1) * limit;

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
        'user.userId AS userId',
        'user.nickname AS nickname',
      ])
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.boardType = :boardType', { boardType })
      .andWhere('comment.deletedAt IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getRawMany();

    const total = await this.commentsRepository.count({
      where: {
        postId,
        boardType,
        deletedAt: null,
      },
    });

    return { comments, total };
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
      .getRawMany();
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

  // 관리자 댓글 또는 답글 삭제
  async deleteCommentOrReply(id: number): Promise<void> {
    // 댓글인지 확인
    const comment = await this.commentsRepository.findOne({
      where: { commentId: id, deletedAt: null },
    });

    if (comment) {
      // 댓글 삭제
      await this.commentsRepository.softDelete(id);
      return;
    }

    // 답글인지 확인
    const reply = await this.repliesRepository.findOne({
      where: { replyId: id, deletedAt: null },
    });

    if (reply) {
      // 답글 삭제
      await this.repliesRepository.softDelete(id);
      return;
    }

    // 댓글도 답글도 아닌 경우
    throw new Error('댓글 또는 답글을 찾을 수 없습니다.');
  }

  // 특정 게시물에 달린 댓글 수 구하기
  async countAllCommentsByPostId(postId: number): Promise<number> {
    return this.commentsRepository.count({ where: { postId, deletedAt: null }})
  }
}
