import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaClient, PrismaModule, PrismaService, User } from '@kata/prisma';
import { UserNotFoundException } from '../../exceptions';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { IToken, LoginReturn } from '@kata/typings';
import { SignInDto } from './auth.dto';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { HashModule } from './hash/hash.module';
import { HashService } from './hash/hash.service';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaMock: DeepMockProxy<PrismaClient>;
  let hashServiceMock: HashService;
  let jwtServiceMock: JwtService;

  const mockUser: User = {
    user_id: 'userid',
    email: 'example@email.com',
    firstname: 'firstname',
    lastname: 'lastname',
    password: '$2b$10$RJr8xxuAjYUwnXgZb8DSUeK9Ty5II4mLUXIsrfIZ7T62UJWAdBIHK',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  const mockLogUser: LoginReturn = {
    tokens: {
      accessToken: 'accesstoken',
      refreshToken: 'refreshtoken',
      expiresIn: 5651681868168,
    },
    user: {
      email: 'example@email.com',
      name: 'firstname lastname',
      userId: 'userid',
    },
  };

  const mockRefreshToken: IToken = {
    accessToken: 'newaccesstoken',
    refreshToken: 'newrefreshtoken',
    expiresIn: 6651681868168,
  };

  const loginDto: SignInDto = {
    email: 'example@email.com',
    password: 'password',
  };

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    hashServiceMock = {
      compare: vi
        .fn()
        .mockImplementation(
          (password: string) => password === loginDto.password
        ),
    } as unknown as HashService;
    jwtServiceMock = {
      signAsync: vi.fn().mockResolvedValue('mockedToken'),
      decode: vi.fn().mockImplementation((token: string) => {
        if (token === mockLogUser.tokens.refreshToken) {
          return { email: mockLogUser.user.email };
        }
        return null;
      }),
    } as unknown as JwtService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: HashService,
          useValue: hashServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
      imports: [
        JwtModule.register({ secretOrPrivateKey: 'secret' }),
        HashModule,
        PrismaModule,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('when the signIn function is called', () => {
    it('should return the user access object if exists and credentials are correct', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      hashServiceMock.compare(loginDto.password, 'hash');
      vi.spyOn(authService as never, 'generateTokens').mockResolvedValue(
        mockLogUser.tokens
      );

      const result = await authService.signIn(loginDto);
      expect(result).toEqual(mockLogUser);
      expect(prismaMock.user.findUnique).toBeCalledTimes(1);
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should return exception when user exists but password is incorrect', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(() =>
        authService.signIn({ ...loginDto, password: 'xxxxxxxxx' })
      ).rejects.toThrow(
        'Votre mot de passe est incorrect. Vérifiez votre saisie.'
      );
      expect(prismaMock.user.findUnique).toBeCalledTimes(1);
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw the UserNotFoundException if user not exists', async () => {
      await expect(() =>
        authService.signIn({
          ...loginDto,
          email: 'xxxxxxxx@email.com',
        })
      ).rejects.toThrow(UserNotFoundException);
      expect(prismaMock.user.findUnique).toBeCalledTimes(1);
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: { email: 'xxxxxxxx@email.com' },
      });
    });
  });

  describe('when the refreshToken function is called', () => {
    it('should return new user access if token refresh is not expired yet', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      vi.spyOn(authService as never, 'generateTokens').mockResolvedValue(
        mockRefreshToken
      );

      const result = await authService.refreshToken(
        mockLogUser.tokens.refreshToken
      );
      expect(result).toEqual(mockRefreshToken);
      expect(prismaMock.user.findUnique).toBeCalledTimes(1);
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: { email: mockLogUser.user.email },
      });
    });

    it('should throw the UserNotFoundException if user not exists', async () => {
      jwtServiceMock.decode('refreshtoken');
      vi.spyOn(authService as never, 'generateTokens').mockResolvedValue(
        mockRefreshToken
      );

      await expect(() =>
        authService.refreshToken('refreshtoken')
      ).rejects.toThrow(UserNotFoundException);
      expect(prismaMock.user.findUnique).toBeCalledTimes(1);
      expect(prismaMock.user.findUnique).toBeCalledWith({
        where: { email: mockLogUser.user.email },
      });
    });
  });
});
