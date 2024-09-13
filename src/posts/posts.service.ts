import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginateQueryDto } from './dto/get-post-query.dto';
import { EBoardType } from './enum/board-type.enum';
import { ESortOrder, ESortType } from './enum/sort-type.enum';
import { PostsEntity } from './entities/base-posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserWithoutPassword } from '../auth/interfaces/session-decorator.interface';
import { ReportPostsEntity } from '../reports/entities/report-posts.entity';
import { BasePostDto } from './dto/base-post.dto';
import { ReportPostDto } from './dto/report-post.dto';
import { ImageEntity } from '../images/entities/image.entity';
import { ImagesService } from '../images/images.service';
import { EReportReason } from 'src/reports/enum';
import { CreatePresignedUrlDto } from 'src/images/dto';
import Redis from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { performance } from 'perf_hooks';
import { ScrapsEntity } from '../scraps/entities/scraps.entity';
import { LikeEntity } from '../likes/entities/likes.entity';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private imagesService: ImagesService,
    @InjectRepository(PostsEntity)
    private postRepository: Repository<PostsEntity>,
    @InjectRepository(ReportPostsEntity)
    private reportPostRepository: Repository<ReportPostsEntity>,
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
    @InjectRepository(ScrapsEntity)
    private scrapRepository: Repository<ScrapsEntity>,
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
  ) {}

  //게시글 조회
  //쿼리값이 하나도 없을 경우 전체조회, 쿼리값이 있을 경우 조건에 맞는 조회
  async getPosts(boardType: EBoardType, paginateQueryDto: PaginateQueryDto) {
    let { page, limit, search, sortOrder, sortType } = paginateQueryDto;
    page = page && Number(page) > 0 ? Number(page) : 1;
    limit = limit && Number(limit) > 0 ? Number(limit) : 10;
    if (limit > 50) {
      throw new BadRequestException('Limit은 50을 넘어갈 수 없습니다.');
    }
    try {
      let query = this.postRepository.createQueryBuilder('post');

      // 작성자 닉네임을 불러오기 위해 조인 추가
      query = query.leftJoinAndSelect('post.user', 'user'); // 'user'는 UsersEntity의 alias

      query = query.select([
        'post.postId', // 게시물 ID
        'post.boardType', // 게시판 카테고리
        'post.title', // 제목
        'user.nickname', // 작성자 닉네임
        'post.createdAt', // 작성일
        'post.viewCounts', // 조회수
        'post.like', // 좋아요수
      ]);

      if (boardType !== 'all') {
        query = query.where('post.boardType = :boardType', { boardType });
      }

      const boardTotal = await query.getCount();

      if (search) {
        query = query.where('post.title LIKE :search OR post.content LIKE :search', { search: `%${search}%` });
      }

      sortType = Object.values(ESortType).includes(sortType) ? sortType : ESortType.DATE;
      sortOrder = Object.values(ESortOrder).includes(sortOrder) ? sortOrder : ESortOrder.DESC;

      switch (sortType) {
        case ESortType.DATE:
          query = query.orderBy('post.createdAt', sortOrder).addOrderBy('post.postId', sortOrder); // ID로 보조 정렬
          break;
        case ESortType.LIKES:
          query = query
            .orderBy('post.like', sortOrder)
            .addOrderBy('post.createdAt', ESortOrder.DESC) // 생성 날짜로 보조 정렬
            .addOrderBy('post.postId', ESortOrder.DESC); // ID로 추가 보조 정렬
          break;
        default:
          query = query.orderBy('post.createdAt', ESortOrder.DESC).addOrderBy('post.postId', ESortOrder.DESC);
      }

      // 페이지네이션 적용
      const skip = (page - 1) * limit;
      query = query.skip(skip).take(limit);

      const [posts, total] = await query.getManyAndCount();
      console.log(posts);

      return {
        posts,
        meta: {
          total,
          boardTotal,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (err) {
      throw err;
    }
  }

  //게시글 생성
  async createPost(
    boardType: EBoardType,
    createPostDto: CreatePostDto,
    sessionUser: IUserWithoutPassword,
  ): Promise<PostsEntity & { presignedPostData: Array<{ url: string; fields: Record<string, string>; key: string }> }> {
    const { title, content, imageTypes } = createPostDto;
    const { userId } = sessionUser;
    try {
      const createdPost = this.postRepository.create({
        title,
        content,
        userId,
        boardType,
      });

      const savedPost = await this.postRepository.save(createdPost);

      let presignedPostData = [];
      if (imageTypes && imageTypes.length > 0) {
        presignedPostData = await Promise.all(
          imageTypes.map((fileType) => {
            const dto = new CreatePresignedUrlDto();
            dto.fileType = fileType;
            this.imagesService.generatePresignedUrl(dto);
          }),
        );

        const imageEntities = presignedPostData.map((data) =>
          this.imageRepository.create({
            url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${data.key}`,
            post: savedPost,
          }),
        );

        await this.imageRepository.save(imageEntities);
        savedPost.images = imageEntities;
      }

      return {
        ...savedPost,
        presignedPostData,
      };
    } catch (err) {
      throw err;
    }
  }

  //특정 게시글 조회
  async getPostDetails(boardType: EBoardType, postId: number, sessionUser: IUserWithoutPassword) {
    const { userId } = sessionUser;
    try {
      const result = await this.postRepository.findOne({
        where: {
          postId,
        },
        relations: ['images'],
      });
      if (!result) throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);

      const redisKey = `post:${postId}:views`;

      // 조회수 증가 (반환값은 증가된 후의 값을 문자열로 반환)
      const viewCounts = await this.redisClient.incr(redisKey);

      const isLiked = await this.likeRepository.exists({ where: { userId, postId } });

      const isScraped = await this.scrapRepository.exists({ where: { userId, postId } });

      // viewCounts를 숫자로 파싱 (필요한 경우)
      return {
        postId: result.postId,
        userId: result.userId,
        title: result.title,
        content: result.content,
        like: result.like,
        viewCounts: result.viewCounts + Number(viewCounts),
        createdAt: result.createdAt,
        isLiked,
        isScraped,
        images: result.images,
      };
    } catch (err) {
      throw err;
    }
  }

  //게시글 수정
  async updatePost(
    boardType: EBoardType,
    postId: number,
    updatePostDto: UpdatePostDto,
    sessionUser: IUserWithoutPassword,
  ) {
    const { userId } = sessionUser;
    try {
      const post = await this.postRepository.findOneBy({ postId });
      if (!post) throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);

      if (post.userId !== userId) {
        throw new ForbiddenException('이 게시물을 수정할 권한이 없습니다.');
      }
      const updatePostFields = Object.entries(updatePostDto).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      Object.assign(post, updatePostFields);

      const updatedPost = await this.postRepository.save(post);
      return updatedPost;
    } catch (err) {
      throw err;
    }
  }

  //게시글 삭제
  async deletePost(boardType: EBoardType, postId: number, sessionUser: IUserWithoutPassword) {
    try {
      const { userId } = sessionUser;
      const post = await this.postRepository.findOneBy({ postId });
      if (!post) throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);

      if (post.userId !== userId) {
        throw new ForbiddenException('이 게시물을 수정할 권한이 없습니다.');
      }

      const updatedPost = await this.postRepository.softDelete(postId);
      return updatedPost;
    } catch (err) {
      throw err;
    }
  }

  //특정 게시글 신고
  async reportPost(basePostDto: BasePostDto, sessionUser: IUserWithoutPassword, reportPostDto: ReportPostDto) {
    const { userId } = sessionUser;
    const { boardType, postId } = basePostDto;
    const post = await this.postRepository.findOneBy(basePostDto);
    if (!post) throw new NotFoundException(`${boardType}게시판의 ${postId}번 게시물을 찾을 수 없습니다.`);
    if (post.userId === userId) {
      throw new ForbiddenException(`자기 자신의 게시물을 신고할 수 없습니다.`);
    }
    if (reportPostDto.reportedReason === EReportReason.OTHER && !reportPostDto.otherReportedReason) {
      throw new BadRequestException(`신고 사유를 기입해주세요.`);
    }
    const existingReport = await this.reportPostRepository.findOne({
      where: {
        postId,
        userId,
      },
    });
    if (existingReport) {
      throw new ConflictException(`이미 신고한 게시물입니다.`);
    }
    const reportedPostDto = this.reportPostRepository.create({
      postId,
      userId,
      ...reportPostDto,
      reportedUserId: post.userId,
    });
    const result = await this.reportPostRepository.save(reportedPostDto);

    return result;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async syncViewCountsToDB() {
    const startTime = performance.now();
    this.logger.log('조회수 동기화 진행중');
    try {
      const keys = await this.redisClient.keys('post:*:views');
      for (const key of keys) {
        const postId = key.split(':')[1];
        const viewCount = await this.redisClient.get(key);
        if (viewCount !== null) {
          const increment = parseInt(viewCount, 10);
          if (!isNaN(increment)) {
            await this.postRepository.increment({ postId: Number(postId) }, 'viewCounts', increment);
          }
        }

        await this.redisClient.del(key);
        const endTime = performance.now();
        this.logger.log(`처리 시간 (게시물 ${postId}): ${(endTime - startTime).toFixed(2)}ms`);
      }
      this.logger.log('동기화 작업 완료');
    } catch (error) {
      this.logger.error('Error during view count synchronization', error);
    }
  }
}
