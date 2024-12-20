import { Test, TestingModule } from '@nestjs/testing';
import { AuthAtGuard } from '../../guards';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IToken, LoginReturn } from '@kata/typings';
import { SignInDto } from './auth.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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

  const mockAuthService = {
    signIn: vi
      .fn()
      .mockImplementation((dto) => (dto === loginDto ? mockLogUser : false)),
    refreshToken: vi
      .fn()
      .mockImplementation((refreshToken: string) =>
        refreshToken === mockLogUser.tokens.refreshToken
          ? mockRefreshToken
          : false
      ),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(AuthAtGuard)
      .useValue({})
      .compile();

    authController = moduleRef.get<AuthController>(AuthController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signIn', () => {
    it('should return the user access object if exists and credentials are correct', async () => {
      const result = await authController.signIn(loginDto);
      expect(result).toEqual(mockLogUser);
      expect(authService.signIn).toHaveBeenCalledWith(loginDto);
    });

    it('should return exception when user exists but password is incorrect', async () => {
      const result = await authController.signIn({
        ...loginDto,
        password: 'xxxx',
      });
      expect(result).toBeFalsy();
      expect(authService.signIn).toHaveBeenCalledWith({
        ...loginDto,
        password: 'xxxx',
      });
    });

    it('should throw the UserNotFoundException if user not exists', async () => {
      const result = await authController.signIn({
        ...loginDto,
        email: 'xxxxxxxx@email.com',
      });
      expect(result).toBeFalsy();
      expect(authService.signIn).toHaveBeenCalledWith({
        ...loginDto,
        email: 'xxxxxxxx@email.com',
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new user access if token refresh is not expired yet', async () => {
      const result = await authController.refreshToken(
        mockLogUser.tokens.refreshToken
      );
      expect(result).toEqual(mockRefreshToken);
      expect(authService.refreshToken).toHaveBeenCalledWith(
        mockLogUser.tokens.refreshToken
      );
    });

    it('should throw the UserNotFoundException if user not exists', async () => {
      const result = await authController.refreshToken('xxxxxxxxxxxxxxx');
      expect(result).toBeFalsy();
      expect(authService.refreshToken).toHaveBeenCalledWith('xxxxxxxxxxxxxxx');
    });
  });
});
