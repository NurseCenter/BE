import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  FindEmailDto,
  FindPasswordDto,
  SendPhoneVerificationDto,
  SignInUserDto,
  VerifyEmailDto,
  VerifyPhoneNumberDto,
} from './dto';
import { SessionUser } from './decorators/get-user.decorator';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { formattingPhoneNumber } from 'src/common/utils/phone-number-utils';
import { InvalidPhoneVerificationCodeException } from 'src/common/exceptions/twilio-sms.exceptions';
import { handlePostPhoneVerificationConfirmError } from './error-handler/handle-post-phone-verification-confirm-error';
import { IUser } from './interfaces';
import { AdminGuard } from './guards';
import clearCookieOptions from './cookie-options/clear-cookie-options';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '회원가입' })
  @ApiBody({
    type: CreateUserDto,
    description: '회원가입에 필요한 정보',
    examples: {
      'example-1': {
        summary: '회원가입 예시 1 (재학생)',
        value: {
          nickname: '달려라뭐하니',
          username: '황서연',
          email: 'gildongtest1@example.com',
          phoneNumber: '01012341234',
          password: 'Password1!',
          status: 'current_student',
          certificationDocumentUrl: 'https://my-bucket.s3.us-west-2.amazonaws.com/certification.pdf',
        },
      },
      'example-2': {
        summary: '회원가입 예시 2 (졸업생)',
        value: {
          nickname: 'dooly123',
          username: '구서진',
          email: 'gildongtest1@example.com',
          phoneNumber: '01012341234',
          password: 'Password1!',
          status: 'graduated_student',
          certificationDocumentUrl: 'https://my-bucket.s3.us-west-2.amazonaws.com/certification.pdf',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '회원가입이 성공적으로 완료되었습니다.',
    schema: {
      example: {
        message: '회원가입이 성공적으로 완료되었습니다.',
        userId: 41,
        email: 'dongdong@example.com',
        username: '최동동',
        nickname: '간호꿈동이',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      example: { message: '잘못된 요청입니다.' },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 가입된 회원입니다.',
    schema: {
      example: { message: '이미 가입된 회원입니다.' },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 닉네임입니다.',
    schema: {
      example: { message: '이미 존재하는 닉네임입니다.' },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 탈퇴한 회원입니다.',
    schema: {
      example: { message: '이미 탈퇴한 회원입니다.' },
    },
  })
  async postSignUp(@Body() createUserDto: CreateUserDto): Promise<{ message: string; userId: number }> {
    const userInfo = await this.authService.signUp(createUserDto);
    return { message: '회원가입이 성공적으로 완료되었습니다.', ...userInfo };
  }

  // 회원탈퇴
  @Delete('withdrawal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원탈퇴' })
  @ApiResponse({
    status: 200,
    description: '회원탈퇴가 성공적으로 완료되었습니다.',
    schema: {
      example: {
        message: '회원탈퇴가 성공적으로 완료되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '권한이 없음' })
  async deleteWithdrawal(@SessionUser() sessionUser: IUser, @Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const { userId } = sessionUser;
      await this.authService.withDraw(userId, req, res);
      res.status(200).json({ message: '회원탈퇴가 성공적으로 완료되었습니다.' });
    } catch (error) {
      console.error('회원탈퇴 처리 중 오류: ', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: '회원탈퇴 처리 중 오류 발생' });
    }
  }

  // 로그인
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그인' })
  @ApiBody({
    type: SignInUserDto,
    description: '로그인에 필요한 정보',
    examples: {
      'example-1': {
        summary: '로그인 예시',
        value: {
          email: 'gildongtest1@example.com',
          password: 'Password1!',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '로그인에 성공하였습니다.',
    content: {
      'application/json': {
        examples: {
          success: {
            summary: '일반 로그인 성공',
            value: {
              message: '로그인이 완료되었습니다.',
              user: {
                userId: 35,
                nickname: '명란젓코난',
                rejected: false,
                isTempPasswordSignIn: false,
                isSuspended: false,
              },
            },
          },
          tempPassword: {
            summary: '임시 비밀번호 로그인 성공',
            value: {
              message: '임시 비밀번호로 로그인되었습니다. 새 비밀번호를 설정해 주세요.',
              user: {
                userId: 35,
                nickname: '명란젓코난',
                rejected: false,
                isTempPasswordSignIn: true,
                isSuspended: false,
                suspensionDuration: '2주',
                suspensionEndDate: '2024-09-30T00:00:00Z',
                suspensionReason: '스팸/도배',
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignIn(
    @Body() signInUserDto: SignInUserDto,
    @Query('autoLogin') autoLogin: boolean,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<{ message: string }> {
    try {
      await this.authService.signIn(signInUserDto, req, res, autoLogin);
      return { message: '로그인이 완료되었습니다.' };
    } catch (error) {
      if (!res.headersSent) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: error.message });
      }
    }
  }

  // 세션 강제 종료
  @UseGuards(AdminGuard)
  @Post('force-sign-out')
  @ApiOperation({ summary: '세션 강제 종료' })
  @ApiBody({
    type: Object,
    description: '강제 종료할 세션 ID',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string', description: '강제 종료할 세션 ID' },
      },
      required: ['sessionId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '세션 강제 종료 성공',
    schema: {
      example: {
        message: '보안 위협이 감지되어 세션이 강제 종료되었습니다.',
        sessionId: 'sess:12345',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '관리자 권한이 없는 경우',
    schema: {
      example: {
        statusCode: 403,
        message: '관리자만 접근할 수 있습니다.',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '세션 삭제 중 오류 발생',
    schema: {
      example: {
        error: '세션 삭제 중 오류가 발생했습니다.',
      },
    },
  })
  async forceSignOut(@Body('sessionId') sessionId: string, @Res() res: Response): Promise<void> {
    try {
      await this.authService.forceSignOut(sessionId);

      // 쿠키 삭제
      res.clearCookie('connect.sid', clearCookieOptions());

      res.status(HttpStatus.OK).json({
        message: '보안 위협이 감지되어 세션이 강제 종료되었습니다.',
        sessionId: sessionId,
      });
    } catch (error) {
      console.error('세션 삭제 중 오류: ', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: '세션 삭제 중 오류가 발생했습니다.',
      });
    }
  }

  // 로그아웃
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({
    status: 200,
    description: '로그아웃에 성공하였습니다.',
    schema: {
      example: {
        message: '로그아웃이 완료되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignOut(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      await this.authService.signOut(req, res);
      res.status(200).json({ message: '로그아웃이 완료되었습니다.' });
    } catch (error) {
      if (!res.headersSent) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: '로그아웃 중 오류가 발생했습니다.' });
      }
    }
  }

  // 모든 세션 로그아웃
  @Post('sign-out-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '모든 세션 로그아웃' })
  @ApiResponse({
    status: 200,
    description: '모든 세션 로그아웃이 성공하였습니다.',
    schema: {
      example: {
        message: '모든 세션이 종료되었습니다.',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignOutAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionId = req.sessionID;
    const userId = req.session?.passport?.user?.userId;

    if (!userId) {
      throw new NotFoundException('회원 ID가 없습니다.');
    }

    try {
      // 1. 해당 세션 ID로 세션 강제 종료
      await this.authService.forceSignOut(sessionId);

      // 2. 해당 userId로 모든 세션 종료
      await this.authService.logoutAll(userId);

      res.status(200).json({ message: '모든 세션이 종료되었습니다.' });
    } catch (error) {
      console.error('모든 세션 종료 중 오류: ', error);
      if (!res.headersSent) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: '모든 세션 종료 중 오류가 발생했습니다.' });
      }
    }
  }

  // 이메일 인증 발송
  @Post('sign-up/email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 발송' })
  @ApiBody({
    type: VerifyEmailDto,
    description: '이메일 인증을 위한 정보',
    examples: {
      'example-1': {
        summary: '이메일 인증 발송 예시',
        value: {
          email: 'happy1234@naver.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '회원가입 인증용 이메일을 발송하였습니다.',
    schema: {
      example: {
        message: '회원가입 인증용 이메일을 발송하였습니다.',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postSignUpEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    await this.authService.sendVerificationEmail(verifyEmailDto);
    return { message: '회원가입 인증용 이메일을 발송하였습니다.' };
  }

  @Get('sign-up/email-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 확인' })
  @ApiQuery({ name: 'token', required: true, type: String, description: '이메일 인증 토큰' })
  @ApiResponse({
    status: 200,
    description: '이메일 인증에 성공하였습니다.',
    schema: {
      example: {
        message: '이메일 인증에 성공하였습니다.',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getSignUpEmailVerification(@Query('token') token: string): Promise<{ message: string }> {
    await this.authService.verifyEmail(token);
    return { message: '이메일 인증에 성공하였습니다.' };
  }

  // 이메일 찾기
  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 찾기' })
  @ApiBody({
    type: FindEmailDto,
    description: '이메일 찾기에 필요한 정보',
    examples: {
      'example-1': {
        summary: '이메일 찾기 예시',
        value: {
          username: '김개똥',
          phoneNumber: '01012349999',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '이메일 찾기가 성공하였습니다.',
    schema: {
      example: {
        message: '이메일 찾기가 성공하였습니다.',
        email: 'dogpoop@example.com',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getEmail(@Body() findEmailDto: FindEmailDto) {
    const email = await this.authService.findEmail(findEmailDto);
    return { message: '이메일 찾기가 성공하였습니다.', email };
  }

  // 비밀번호 찾기 (임시 비밀번호 발급)
  @Post('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 찾기 (임시 비밀번호 발급)' })
  @ApiBody({
    type: FindPasswordDto,
    description: '비밀번호 찾기에 필요한 정보',
    examples: {
      'example-1': {
        summary: '비밀번호 찾기 예시',
        value: {
          username: '김개똥',
          email: 'dogpoop@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '임시 비밀번호 발급이 성공하였습니다.',
    schema: {
      example: {
        message: '임시 비밀번호 발급이 성공하였습니다.',
        email: 'hi*****@gmail.com',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getPassword(@Body() findPasswordDto: FindPasswordDto): Promise<{ message: string; maskedEmail: string }> {
    const maskedEmail = await this.authService.findPassword(findPasswordDto);
    return { message: '임시 비밀번호 발급이 성공하였습니다.', maskedEmail };
  }

  // 휴대폰 인증번호 발급
  @Post('phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '휴대폰 인증번호 발급' })
  @ApiBody({
    type: VerifyPhoneNumberDto,
    description: '휴대폰 인증번호 발급을 위한 정보',
    examples: {
      'example-1': {
        summary: '휴대폰 인증번호 발급 예시',
        value: {
          phoneNumber: '01012341234',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '휴대폰 인증번호 발급이 성공하였습니다.',
    schema: {
      example: {
        message: '휴대폰 인증번호 발급이 성공하였습니다.',
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async postPhoneVerificationCode(@Body() sendPhoneVerificationDto: SendPhoneVerificationDto) {
    const { phoneNumber } = sendPhoneVerificationDto;
    await this.authService.sendPhoneVerificationCode(phoneNumber);
    return { message: '휴대폰 인증번호가 발급되었습니다.' };
  }

  // 휴대폰 인증번호 발급 확인
  @Post('phone-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '휴대폰 인증번호 발급 확인' })
  @ApiBody({
    type: VerifyPhoneNumberDto,
    description: '휴대폰 인증번호 확인을 위한 정보',
    examples: {
      'example-1': {
        summary: '휴대폰 인증번호 발급 확인 예시',
        value: {
          phoneNumber: '01012341234',
          code: '654321',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '휴대폰 인증이 성공하였습니다.',
    schema: {
      example: {
        message: '휴대폰 인증이 성공하였습니다.',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 전화번호 형식입니다. 전화번호는 01012345678과 같은 11자리 숫자로 이루어져야 합니다.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '잘못된 전화번호 형식입니다. 전화번호는 01012345678과 같은 11자리 숫자로 이루어져야 합니다.',
        },
        error: { type: 'string', example: 'Invalid PhoneNumber Request Type' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '잘못된 인증 코드입니다. 입력한 코드를 확인해주세요.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '잘못된 인증 코드입니다. 입력한 코드를 확인해주세요.' },
        error: { type: 'string', example: 'Invalid Verification Code' },
        statusCode: { type: 'number', example: 403 },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '해당 전화번호에 대한 인증 내역이 없습니다. 인증이 없거나 유효 기간이 지났습니다.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '해당 전화번호에 대한 인증 내역이 없습니다. 인증이 없거나 유효 기간이 지났습니다.',
        },
        error: { type: 'string', example: 'No Verification Record' },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: '이미 인증이 완료된 전화번호입니다. 추가 인증이 필요하지 않습니다.',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: '이미 인증이 완료된 전화번호입니다. 추가 인증이 필요하지 않습니다.' },
        error: { type: 'string', example: 'Already Verified' },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: '최대 인증 시도 횟수(5회)에 도달했습니다. 인증을 처음부터 다시 시도해주세요.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: '최대 인증 시도 횟수(5회)에 도달했습니다. 인증을 처음부터 다시 시도해주세요.',
        },
        error: { type: 'string', example: 'Max Check Attempts Reached' },
        statusCode: { type: 'number', example: 429 },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버에서 오류가 발생했습니다.',
    schema: {
      example: {
        message: '서버에서 오류가 발생했습니다.',
        error: 'Internal Server Error',
        statusCode: 500,
      },
    },
  })
  async postPhoneVerificationConfirm(@Body() verifyPhoneNumberDto: VerifyPhoneNumberDto) {
    const { phoneNumber, code } = verifyPhoneNumberDto;
    const formattedPhoneNumber = formattingPhoneNumber(phoneNumber);

    try {
      const result = await this.authService.verifyPhoneNumberCode(formattedPhoneNumber, code);

      if (!result.valid) {
        throw new InvalidPhoneVerificationCodeException();
      }

      return { message: '휴대폰 인증이 성공하였습니다.' };
    } catch (error) {
      handlePostPhoneVerificationConfirmError(error);
    }
  }

  // 사용자 상태 확인 후 전달
  @Get('user-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 상태 확인' })
  @ApiResponse({
    status: 200,
    description: '사용자 상태 확인 성공',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            userId: { type: 'number', example: 123 },
            email: { type: 'string', example: 'user@example.com' },
            nickname: { type: 'string', example: 'nickname' },
            membershipStatus: {
              type: 'string',
              enum: ['non_member', 'pending_verification', 'email_verified', 'approved_member'],
              example: 'approved_member',
            },
            rejected: { type: 'boolean', example: false },
            isTempPasswordSignIn: { type: 'boolean', example: false },
            isSuspended: { type: 'boolean', example: false },
            suspensionReason: { type: 'string', nullable: true, example: '부적절한 행동' },
            suspensionDuration: { type: 'number', nullable: true, example: 30 },
            suspensionEndDate: { type: 'string', nullable: true, example: '2024-09-30T00:00:00Z' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'error' },
        message: { type: 'string', example: '잘못된 요청입니다.' },
      },
    },
  })
  async getUserStatus(@SessionUser() sessionUser: IUser) {
    const { userId } = sessionUser;
    return this.authService.sendUserStatus(userId);
  }

  // 세션 만료 여부 확인 후 전달
  @Get('session-status')
  @ApiOperation({ summary: '세션 만료 여부 확인' })
  @ApiResponse({
    status: 200,
    description: '세션 만료 여부 확인. 세션이 만료되었으면 `true`, 그렇지 않으면 `false`를 반환함.',
    schema: {
      type: 'object',
      properties: {
        expires: {
          type: 'boolean',
          example: false,
        },
        remainingTime: {
          type: 'string',
          example: '1406 분',
        },
        userId: {
          type: 'number',
          example: 39,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '세션이 만료된 경우',
    schema: {
      type: 'object',
      properties: {
        expires: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  async getSessionStatus(@Req() req: Request) {
    return await this.authService.sendSessionStatus(req);
  }

  // 관리자 계정 여부 확인 후 전달
  @Get('is-admin')
  @ApiOperation({ summary: '관리자 계정 여부 확인' })
  @ApiResponse({
    status: 200,
    description: '관리자 여부 확인\n' + '관리자 계정이면 `true`, 그렇지 않으면 `false`를 반환함.',
    schema: {
      type: 'object',
      properties: {
        isAdmin: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  async getIsAdmin(@Req() req: Request) {
    return await this.authService.sendIsAdmin(req);
  }
}
