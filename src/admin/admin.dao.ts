import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeletedUsersEntity, SuspendedUsersEntity } from './entities';
import { UsersEntity } from 'src/users/entities/users.entity';
import { EMembershipStatus } from 'src/users/enums';
import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import { CommentsEntity } from 'src/comments/entities/comments.entity';
import { RepliesEntity } from 'src/replies/entities/replies.entity';

@Injectable()
export class AdminDAO {
  constructor(
    @InjectRepository(DeletedUsersEntity)
    private readonly deletedUsersRepository: Repository<DeletedUsersEntity>,
    @InjectRepository(SuspendedUsersEntity)
    private readonly suspendedUsersRepository: Repository<SuspendedUsersEntity>,
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    @InjectRepository(PostsEntity)
    private readonly postsRepository: Repository<PostsEntity>,
    @InjectRepository(CommentsEntity)
    private readonly commentsRepository: Repository<CommentsEntity>,
    @InjectRepository(RepliesEntity)
    private readonly repliesRepository: Repository<RepliesEntity>,
  ) {}

  // 회원 탈퇴 시 DeletedUsersEntity에 새로운 객체를 생성
  async createDeletedUser(userId: number): Promise<DeletedUsersEntity> {
    const newDeletedUser = this.deletedUsersRepository.create({ userId });
    return newDeletedUser;
  }

  // DeletedUsersEntity에 저장
  async saveDeletedUser(deletedUserEntity: DeletedUsersEntity): Promise<DeletedUsersEntity> {
    return await this.deletedUsersRepository.save(deletedUserEntity);
  }

  // 회원 정지 시 SuspendedUsersEntity에 새로운 엔티티 객체를 생성
  async createSuspendedUser(userId: number): Promise<SuspendedUsersEntity> {
    const newSuspendedUser = this.suspendedUsersRepository.create({ userId });
    return newSuspendedUser;
  }

  // SuspendedUsersEntity에 저장
  async saveSuspendedUser(suspendedUserEntity: SuspendedUsersEntity): Promise<SuspendedUsersEntity> {
    return await this.suspendedUsersRepository.save(suspendedUserEntity);
  }

  // 페이지네이션 회원 조회
  async findUsersWithDetails(page: number, pageSize: number = 10): Promise<[any[], number]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'posts')
      .leftJoinAndSelect('user.comments', 'comments')
      .select([
        'user.userId', // 회원 ID (렌터링 X)
        'user.nickname', // 닉네임
        'user.email', // 이메일
        'COUNT(posts.id) AS postCount', // 게시물 수
        'COUNT(comments.id) AS commentCount', // 댓글 수
        'user.createdAt', // 가입날짜
      ])
      .groupBy('user.userId')
      .orderBy('user.createdAt', 'DESC') // 가입일 기준 내림차순 정렬
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [rawUsers, total] = await Promise.all([queryBuilder.getRawMany(), this.countTotalUsers()]);

    return [rawUsers, total];
  }

  // 정지된 회원 조회
  async findSuspendedUsers() {
    return this.suspendedUsersRepository.find();
  }

  // 탈퇴된 회원 조회
  async findDeletedUsers() {
    return this.deletedUsersRepository.find();
  }

  // 전체 사용자 수 계산
  async countTotalUsers(): Promise<number> {
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .select('COUNT(user.userId)', 'total')
      .getRawOne();
    return Number(result.total);
  }

  // 승인 대기중, 승인 거절당한 회원 조회
  async findPendingAndRejectVerifications(pageNumber: number, pageSize: number = 10): Promise<[UsersEntity[], number]> {
    return this.usersRepository.findAndCount({
      // 탈퇴한 회원은 제외함.
      where: [
        { membershipStatus: EMembershipStatus.PENDING_VERIFICATION, deletedAt: null },
        { rejected: false, deletedAt: null },
      ],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      order: {
        createdAt: 'DESC', // 가입일 기준 내림차순
      },
    });
  }

  // 게시물 관리 페이지 데이터 조회
  async findAllPosts(pageNumber: number, pageSize: number): Promise<[PostsEntity[], number]> {
    const skip = (pageNumber - 1) * pageSize;

    const queryBuilder = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select([
        'post.postId', // 게시물 ID (렌더링 X)
        'post.boardType', // 카테고리
        'post.title', // 제목
        'user.nickname', // 작성자(닉네임)
        'post.createdAt', // 작성일자
      ])
      .where('post.deletedAt IS NULL') // 삭제된 게시물 제외
      .orderBy('post.createdAt', 'DESC') // 작성일 기준 내림차순
      .skip(skip)
      .take(pageSize);

    const [posts, total] = await Promise.all([queryBuilder.getRawMany(), this.countTotalPosts()]);

    return [posts, total];
  }

  // 게시물 수 계산
  async countTotalPosts(): Promise<number> {
    const result = await this.postsRepository
      .createQueryBuilder('post')
      .select('COUNT(post.postId)', 'total')
      .where('post.deletedAt IS NULL') // 삭제된 게시물 제외
      .getRawOne();
    return Number(result.total);
  }

  // 특정 게시물 삭제
  async deletePost(postId: number): Promise<PostsEntity | null> {
    const post = await this.postsRepository.findOne({
      where: { postId, deletedAt: null },
    });

    if (post) {
      post.deletedAt = new Date();
      await this.postsRepository.save(post);
      return post;
    }

    return null; // 게시물이 없거나 이미 삭제된 경우
  }

  // 모든 댓글 조회
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

  // 모든 답글 조회
  async findAllReplies(): Promise<any[]> {
    return this.repliesRepository
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.user', 'user')
      .leftJoinAndSelect('reply.post', 'post')
      .select([
        'reply.replyId', // 답글 ID
        'reply.content', // 답글 내용
        'reply.createdAt', // 작성일
        'user.nickname', // 작성자 닉네임
        'post.title', // 게시물 제목
        'post.boardType', // 게시물 카테고리
      ])
      .where('reply.deletedAt IS NULL')
      .getRawMany();
  }

  // 특정 댓글 조회
  async findCommentById(id: number): Promise<any> {
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

  // 특정 답글 조회
  async findReplyById(id: number): Promise<any> {
    return this.repliesRepository
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.user', 'user')
      .leftJoinAndSelect('reply.post', 'post')
      .select([
        'reply.replyId', // 답글 ID
        'reply.content', // 답글 내용
        'reply.createdAt', // 작성일
        'user.nickname', // 작성자 닉네임
        'post.title', // 게시물 제목
        'post.boardType', // 게시물 카테고리
      ])
      .where('reply.replyId = :id AND reply.deletedAt IS NULL', { id })
      .getRawOne();
  }

  // 댓글 또는 답글 삭제
  async deleteCommentOrReply(id: number): Promise<void> {
    // 댓글인지 확인
    const comment = await this.commentsRepository.findOne({
      where: { commentId: id, deletedAt: null },
    });
    if (comment) {
      await this.commentsRepository.update(id, { deletedAt: new Date() });
      return;
    }

    // 답글인지 확인
    const reply = await this.repliesRepository.findOne({
      where: { commentId: id, deletedAt: null },
    });
    if (reply) {
      await this.repliesRepository.update(id, { deletedAt: new Date() });
      return;
    }
  }
}
