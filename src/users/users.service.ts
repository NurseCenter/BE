import { Injectable } from '@nestjs/common';
import { IUserWithoutPassword } from 'src/auth/interfaces';
import { IUserInfoResponse } from './interfaces/user-info-response.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PostsEntity } from 'src/posts/entities/base-posts.entity';
import { CommentsEntity } from 'src/comments/entities/comments.entity';
import { RepliesEntity } from 'src/replies/entities/replies.entity';
import { UpdateNicknameDto, UpdatePasswordDto } from './dto';
import { AuthPasswordService, AuthUserService } from 'src/auth/services';
import { UsersEntity } from './entities/users.entity';

@Injectable()
export class UsersService {
    constructor(
        private readonly authUserService: AuthUserService,
        private readonly authPasswordService: AuthPasswordService,
        @InjectRepository(UsersEntity)
        private readonly usersRepository:
        Repository<UsersEntity>, 
        @InjectRepository(PostsEntity)
        private readonly postsRepository: Repository<PostsEntity>,
        @InjectRepository(CommentsEntity)
        private readonly commentsRepository: Repository<CommentsEntity>,
        @InjectRepository(RepliesEntity)
        private readonly repliesRepository: Repository<RepliesEntity>
    ) {}

    // 나의 정보 조회
    async fetchMyInfo(sessionUser: IUserWithoutPassword): Promise<IUserInfoResponse> {
        const { nickname, email, username, phoneNumber } = sessionUser;
        return { nickname, email, username, phoneNumber };
    }

    // 나의 닉네임 수정
    async updateMyNickname(sessionUser: IUserWithoutPassword, updateNicknameDto: UpdateNicknameDto) {
        const { userId } = sessionUser;
        const { newNickname } = updateNicknameDto;
        
        const user = await this.authUserService.findUserByUserId(userId);

        if (!user) {
            throw new Error('해당 회원이 존재하지 않습니다.');
        }

        user.nickname = newNickname;

        await this.usersRepository.save(user);

        return { message: '닉네임이 수정되었습니다.' }
    }

    // 나의 비밀번호 수정
    async updateMyPassword(sessionUser: IUserWithoutPassword, updatePasswordDto: UpdatePasswordDto) {
        const { userId } = sessionUser;
        const { oldPassword, newPassword } = updatePasswordDto;

        const user = await this.usersRepository.findOne({ where: { userId } });

        if (!user) {
            throw new Error('해당 회원이 존재하지 않습니다.');
        }

        const isOldPasswordValid = this.authPasswordService.matchPassword(oldPassword, newPassword);

        if (!isOldPasswordValid) {
            throw new Error("비밀번호가 일치하지 않습니다.")
        }

        const newHashedPassword = await this.authPasswordService.createPassword(newPassword);

        user.password = newHashedPassword;

        await this.usersRepository.save(user);

        return { message: '비밀번호가 수정되었습니다.' };
    }


    // 내가 쓴 게시물 전체 조회
    async fetchMyPosts(sessionUser: IUserWithoutPassword) {
        const { userId } = sessionUser;

        // userId와 일치하는 게시물 조회
        const posts = await this.postsRepository.find({
            where: { user: { userId }}
        })
        
        return posts;
    }

    // 내가 쓴 댓글과 답글 전체 조회
    // 댓글과 답글을 시간순으로 정렬
    async fetchMyComments(sessionUser: IUserWithoutPassword) {
        const { userId } = sessionUser;

        // userId와 일치하는 댓글과 대댓글 조회
        const comments = await this.commentsRepository.find({
            where: { userId }
        })
        const replies = await this.repliesRepository.find({
            where: { userId }
        })

        return [ ...comments, ...replies ];
    }
}
