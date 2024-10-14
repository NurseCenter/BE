import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommentsDAO } from 'src/comments/comments.dao';
import { RepliesDAO } from 'src/replies/replies.dao';
import { summarizeContent } from 'src/common/utils/summarize.utils';
import { FilesService } from 'src/files/files.service';
import { FilesDAO } from 'src/files/files.dao';
import { CreatePostDto, UpdatePostDto } from 'src/posts/dto';
import { EBoardType } from 'src/posts/enum/board-type.enum';
import { IPostResponse } from 'src/posts/interfaces';
import { PostsMetricsDAO } from 'src/posts/metrics/posts-metrics-dao';
import { PostsDAO } from 'src/posts/posts.dao';

@Injectable()
export class TestPostsService {
  constructor(
    private readonly postsDAO: PostsDAO,
    private readonly postsMetricsDAO: PostsMetricsDAO,
    private readonly commentsDAO: CommentsDAO,
    private readonly repliesDAO: RepliesDAO,
    private readonly filesService: FilesService,
    private readonly filesDAO: FilesDAO,
  ) {}

  // 게시물 생성
  async createPost(createPostDto: CreatePostDto): Promise<IPostResponse> {
    const { title, content, boardType, fileUrls, hospitalNames } = createPostDto;
    const userId = 10041004;

    const createdPost = await this.postsDAO.createPost(title, content, userId, hospitalNames, boardType);
    await this.postsDAO.savePost(createdPost);

    await this.filesService.uploadFiles(fileUrls, createdPost.postId);

    const summaryContent = summarizeContent(content);

    return {
      postId: createdPost.postId, // 게시물 ID
      userId: createdPost.userId, // 작성자 ID
      title: createdPost.title, // 게시물 제목
      content: summaryContent, // 내용 (요약본)
      hospitalNames: createdPost.hospitalNames, // 게시물과 관련된 병원 이름 (배열)
      createdAt: createdPost.createdAt, // 작성일
    };
  }

  // 특정 게시글 조회
  async getOnePost(boardType: EBoardType, postId: number) {
    const post = await this.postsDAO.findOnePostByPostId(postId);
    const existsInBoardType = await this.postsDAO.findPostByIdAndBoardType(postId, boardType);
    const numberOfCommentsAndReplies = await this.getNumberOfCommentsAndReplies(postId);

    if (!post || !existsInBoardType) {
      throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);
    }

    await this.postsMetricsDAO.increaseViewCount(postId);

    const urlArray = await this.filesDAO.getFileUrlsInOnePost(postId);

    return {
      postId: post.postId, // 게시물 ID
      category: post.boardType, // 게시판 카테고리
      title: post.title, // 게시물 제목
      content: post.content, // 게시물 내용
      hospitalNames: post.hospitalNames, // 병원 이름
      likeCounts: post.likeCounts, // 좋아요수
      viewCounts: post.viewCounts, // 조회수
      createdAt: post.createdAt, // 작성일
      updatedAt: post.updatedAt, // 수정일 (업데이트 유무 렌더링)
      user: post.user, // 작성자 정보
      numberOfComments: numberOfCommentsAndReplies, // 댓글과 답글 수
      fileUrls: urlArray, // 게시글에 첨부된 파일 URL들
    };
  }

  // 게시글 수정
  async updatePost(postId: number, updatePostDto: UpdatePostDto): Promise<IPostResponse | { message: string }> {
    const userId = 10041004;
    const { title, content, boardType, fileUrls } = updatePostDto;

    const post = await this.postsDAO.findOnePostByPostId(postId);
    const existsInBoardType = await this.postsDAO.findPostByIdAndBoardType(postId, boardType);

    if (!post || !existsInBoardType)
      throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);

    if (post.user.userId !== userId) {
      throw new ForbiddenException('이 게시물을 수정할 권한이 없습니다.');
    }

    // 변경 플래그
    let contentChanged = false;
    let boardTypeChanged = false;
    let filesChanged = false;

    // 제목 변경
    if (title !== null && title !== undefined && post.title !== title) {
      post.title = title;
      contentChanged = true;
    }

    // 본문 내용 변경
    if (content !== null && content !== undefined && post.content !== content) {
      post.content = content;
      contentChanged = true;
    }

    // 카테고리 변경
    if (boardType !== null && boardType !== undefined && post.boardType !== boardType) {
      post.boardType = boardType;
      boardTypeChanged = true;
    }

    // 업로드한 파일 URL 배열 변경
    if (fileUrls !== undefined) {
      if (fileUrls.length > 0) {
        const fileEntities = await this.filesService.uploadFiles(fileUrls, postId);
        post.files = fileEntities;
        filesChanged = true;
      } else {
        post.files = [];
        filesChanged = true;
      }
    }

    // 아무 것도 수정되지 않은 경우
    if (!contentChanged && !boardTypeChanged && !filesChanged) {
      return { message: '수정된 내용이 없습니다.' };
    }

    // 변경된 경우에만 updatedAt에 현재 날짜 넣어주기
    if (contentChanged || boardTypeChanged || filesChanged) {
      post.updatedAt = new Date();
    }

    const updatedPost = await this.postsDAO.savePost(post);
    const summaryContent = summarizeContent(updatedPost.content);

    return {
      postId: updatedPost.postId, // 게시물 ID
      userId: updatedPost.user.userId, // 작성자 ID
      title: updatedPost.title, // 게시물 제목
      content: summaryContent, // 내용 (요약본)
      hospitalNames: updatedPost.hospitalNames, // 병원 이름
      createdAt: updatedPost.createdAt, // 작성일
      updatedAt: updatedPost.updatedAt, // 수정일
    };
  }

  // 게시글 삭제
  async deletePost(boardType: EBoardType, postId: number): Promise<{ message: string }> {
    try {
      const userId = 10041004;
      const post = await this.postsDAO.findOnePostByPostId(postId);
      const existsInBoardType = await this.postsDAO.findPostByIdAndBoardType(postId, boardType);

      if (!post || !existsInBoardType)
        throw new NotFoundException(`${boardType} 게시판에서 ${postId}번 게시물을 찾을 수 없습니다.`);

      if (post.user.userId !== userId) {
        throw new ForbiddenException('이 게시물을 삭제할 권한이 없습니다.');
      }

      if (post.deletedAt !== null) {
        throw new ConflictException('이미 삭제된 게시물입니다.');
      }

      // 첨부파일 URL 조회
      const fileUrls = await this.filesDAO.getFileUrlsInOnePost(postId);
      const deletionErrors: string[] = [];

      // 반복문으로 URL을 하나씩 찾아서 삭제
      for (const url of fileUrls) {
        const fileToDelete = await this.filesDAO.getOneFileUrl(url);
        if (fileToDelete) {
          const deleteResult = await this.filesDAO.deleteFile(fileToDelete);
          if (deleteResult.affected === 0) {
            deletionErrors.push(`URL: ${url}는 삭제되지 않았습니다.`);
          }
        }
      }

      const result = await this.postsDAO.deletePost(postId);
      if (result.affected === 0) {
        throw new InternalServerErrorException(`게시물 삭제 중 에러가 발생하였습니다.`);
      }

      return { message: '게시물이 삭제되었습니다.', ...(deletionErrors.length > 0 && { errors: deletionErrors }) };
    } catch (err) {
      throw err;
    }
  }

  // 한 게시물에 달린 댓글과 답글 수 구하기
  async getNumberOfCommentsAndReplies(postId: number): Promise<number> {
    const numberOfComments = (await this.commentsDAO.countAllCommentsByPostId(postId)) || 0;
    const numberOfReplies = (await this.repliesDAO.countAllrepliesByPostId(postId)) || 0;

    const total = numberOfComments + numberOfReplies;
    return total;
  }
}
