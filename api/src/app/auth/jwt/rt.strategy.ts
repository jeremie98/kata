import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RtPlayerStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh'
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_RT,
      passReqToCallback: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(refreshToken: string, payload: any) {
    return {
      ...payload,
      refreshToken,
    };
  }
}
