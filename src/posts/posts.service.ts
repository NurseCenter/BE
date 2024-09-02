import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CreatePostDto } from './dto/create-post.dto';

import { UpdatePostDto } from './dto/update-post.dto';
import { PaginateQueryDto } from './dto/get-post-query.dto';
import { BoardType } from './enum/boardType.enum';
import { SortOrder, SortType } from './enum/sortType.enum';
import { PostsEntity } from './entities/base-posts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/interfaces/session-decorator.interface';

@Injectable()
export class PostsService {
  @InjectRepository(PostsEntity)
  private postRepository: Repository<PostsEntity>;
  //게시글 조회
  //쿼리값이 하나도 없을 경우 전체조회, 쿼리값이 있을 경우 조건에 맞는 조회
  async getPosts(boardType: BoardType, paginateQueryDto: PaginateQueryDto) {
    let { page, limit, search, sortOrder, sortType } = paginateQueryDto;
    page = page && Number(page) > 0 ? Number(page) : 1;
    limit = limit && Number(limit) > 0 ? Number(limit) : 10;
    console.log(sortOrder);
    if (limit > 50) {
      throw new BadRequestException('Limit은 50을 넘어갈 수 없습니다.');
    }
    try {
      let query = this.postRepository.createQueryBuilder('post');

      query = query.where('post.boardType = :boardType', { boardType });

      if (search) {
        query = query.where('post.title LIKE :search OR post.content LIKE :search', { search: `%${search}%` });
      }

      sortType = Object.values(SortType).includes(sortType) ? sortType : SortType.DATE;
      sortOrder = Object.values(SortOrder).includes(sortOrder) ? sortOrder : SortOrder.DESC;

      switch (sortType) {
        case SortType.DATE:
          query = query.orderBy('post.createdAt', sortOrder).addOrderBy('post.postId', sortOrder); // ID로 보조 정렬
          break;
        case SortType.LIKES:
          query = query
            .orderBy('post.likes', sortOrder)
            .addOrderBy('post.createdAt', SortOrder.DESC) // 생성 날짜로 보조 정렬
            .addOrderBy('post.postId', SortOrder.DESC); // ID로 추가 보조 정렬
          break;
        default:
          query = query.orderBy('post.createdAt', SortOrder.DESC).addOrderBy('post.postId', SortOrder.DESC);
      }

      // 페이지네이션 적용
      const skip = (page - 1) * limit;
      query = query.skip(skip).take(limit);

      const [posts, total] = await query.getManyAndCount();

      return {
        posts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (err) {
      throw err;
    }
  }

  //게시글 생성
  async createPost(boardType: BoardType, createpostDto: CreatePostDto, sessionUser: User): Promise<PostsEntity> {
    const { title, content } = createpostDto;
    const { userId } = sessionUser;

    try {
      const createdPost = this.postRepository.create({
        title,
        content,
        userId,
        boardType,
      });

      const savedPost = await this.postRepository.save(createdPost);

      return savedPost;
    } catch (err) {
      throw err;
    }
  }

  //특정 게시글 조회
  async getPostDetails(boardType: BoardType, postId: number) {
    try {
      const result = await this.postRepository.findOneBy({ postId });
      if (!result) throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //특정 게시글 신고
  //게시글 수정
  async updatePost(boardType: BoardType, postId: number, updatePostDto: UpdatePostDto, sessionUser: User) {
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
  async deletePost(boardType: BoardType, postId: number, sessionUser: User) {
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
}
