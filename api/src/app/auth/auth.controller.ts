import { Headers, Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { IToken } from '@kata/typings';
import { AuthService } from './auth.service';
import { Public } from '../../decorators';
import { AuthorizationAccess, AuthRtGuard } from '../../guards';
import { extractAccessTokenFromBearer } from '@kata/helpers';
import { SignInDto, SignInResponseDto, TokensDto } from './auth.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCustom } from '../../utils/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(AuthorizationAccess)
  @Post('login')
  @ApiOperation({ summary: 'Login user to the app' })
  @ApiOkResponseCustom(SignInResponseDto)
  async signIn(@Body() signIn: SignInDto): Promise<SignInResponseDto> {
    return await this.authService.signIn(signIn);
  }

  @UseGuards(AuthRtGuard)
  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh user token' })
  @ApiOkResponseCustom(TokensDto)
  async refreshToken(
    @Headers('authorization') refreshToken: string
  ): Promise<IToken | null> {
    return await this.authService.refreshToken(
      extractAccessTokenFromBearer(refreshToken)
    );
  }
}
