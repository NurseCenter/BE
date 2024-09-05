import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { IUserWithoutPassword } from '../interfaces/index';
import { AuthUserService } from '../services';
import { SignInUserDto } from '../dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authUserService: AuthUserService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(signInUserDto: SignInUserDto): Promise<IUserWithoutPassword> {
    const user = await this.authUserService.validateUser(signInUserDto);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
