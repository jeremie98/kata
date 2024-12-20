export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginReturn {
  user: UserAccess;
  tokens: IToken;
}

export interface IToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface JWTPayload {
  iat?: number;
  exp?: number;
}

export interface UserAccess extends JWTPayload {
  userId: string;
  email: string;
  name: string;
}
