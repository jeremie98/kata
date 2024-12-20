import { HttpException, Injectable } from '@nestjs/common';
import { Prisma, PrismaService } from '@kata/prisma';
import { JwtService } from '@nestjs/jwt';
import { HashService } from './hash/hash.service';
import { IToken, UserAccess, LoginReturn } from '@kata/typings';
import { SignInDto } from './auth.dto';
import { User } from '@kata/typings';
import { UserNotFoundException } from '../../exceptions';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService
  ) {}

  async signIn(payload: SignInDto): Promise<LoginReturn> {
    payload.email = payload.email.trim().toLowerCase();

    const checkUser = await this.findUniqueUser({
      where: { email: payload.email },
    });

    if (!checkUser) throw new UserNotFoundException();

    if (payload.password && checkUser.password) {
      const checkPassword = await this.hashService.compare(
        payload.password,
        checkUser.password
      );

      if (checkPassword) {
        const tokens = await this.generateTokens(checkUser);

        return {
          user: {
            userId: checkUser.user_id,
            email: checkUser.email,
            name: `${checkUser.firstname} ${checkUser.lastname}`,
          },
          tokens,
        };
      } else {
        throw new HttpException(
          'Votre mot de passe est incorrect. Vérifiez votre saisie.',
          400
        );
      }
    }
    throw new Error('Missing body.password or user.password');
  }

  async refreshToken(refreshToken: string): Promise<IToken> {
    const decodedRefreshToken =
      await this.tokenDecode<UserAccess>(refreshToken);

    const user = await this.findUniqueUser({
      where: { email: decodedRefreshToken.email },
    });

    if (!user) throw new UserNotFoundException();

    return this.generateTokens(user);
  }

  async tokenDecode<T>(token: string): Promise<T> {
    return this.jwtService.decode(token);
  }

  async checkAccessToken(accessToken: string): Promise<boolean> {
    return this.verifiedAccess(
      accessToken,
      process.env.JWT_SECRET_AT as string
    );
  }

  async checkRefreshToken(accessToken: string): Promise<boolean> {
    return this.verifiedAccess(
      accessToken,
      process.env.JWT_SECRET_RT as string
    );
  }

  async authorizationAccess(email: string): Promise<boolean> {
    const user = await this.findUniqueUser({
      where: { email },
    });

    if (user?.user_id && user.deleted_at === null) return true;

    return false;
  }

  private async verifiedAccess(
    accessToken: string,
    secretJWT: string
  ): Promise<boolean> {
    const verifiedToken = this.jwtService.verify<UserAccess>(accessToken, {
      secret: secretJWT,
    });
    const isAuthorized = await this.authorizationAccess(verifiedToken.email);

    if (verifiedToken && isAuthorized) return true;

    return false;
  }

  private async findUniqueUser(
    args: Prisma.UserFindUniqueArgs
  ): Promise<(User & {}) | null> {
    return await this.prisma.user.findUnique(args);
  }

  private async generateTokens(user: User): Promise<IToken> {
    const { user_id, email, firstname, lastname } = user;

    const accessToken = await this.jwtService.signAsync(
      {
        userId: user_id,
        email,
        name: `${firstname} ${lastname}`,
      },
      {
        secret: process.env.JWT_SECRET_AT,
        expiresIn: '1d',
      }
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        userId: user_id,
        email,
        name: `${firstname} ${lastname}`,
      },
      {
        secret: process.env.JWT_SECRET_RT,
        expiresIn: '7d',
      }
    );

    const expiresIn = new Date().setTime(
      new Date().getTime() + 1 * 24 * 60 * 60 * 1000 // 1d in milliseconds
    );

    return { accessToken, refreshToken, expiresIn };
  }
}
