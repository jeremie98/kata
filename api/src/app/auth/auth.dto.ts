import {
  type IToken,
  type LoginParams,
  type LoginReturn,
  type UserAccess,
} from '@kata/typings';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SignInDto implements LoginParams {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class TokensDto implements IToken {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  expiresIn!: number;
}

class UserAccessDto implements UserAccess {
  @ApiProperty()
  userId!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;
}

export class SignInResponseDto implements LoginReturn {
  @ApiProperty({ type: TokensDto })
  tokens!: IToken;

  @ApiProperty({ type: UserAccessDto })
  user!: UserAccess;
}
