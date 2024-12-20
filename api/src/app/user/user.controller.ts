import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthAtGuard } from '../../guards';
import { ApiOkResponseCustom } from '../../utils/swagger';
import { User } from '../../decorators';
import type { UserAccess } from '@kata/typings';
import { EventResponseDto } from '../event/event.dto';

@Controller('users')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthAtGuard)
  @Get('participants')
  @ApiOperation({ summary: 'Fetch all participants' })
  @ApiOkResponseCustom(UserResponseDto, true)
  async fetchParticipants(): Promise<UserResponseDto[]> {
    return await this.userService.fetchAllUsers();
  }

  @UseGuards(AuthAtGuard)
  @Get()
  @ApiOperation({ summary: 'Fetch current user' })
  @ApiOkResponseCustom(UserResponseDto)
  async findCurrentUser(@User() user: UserAccess): Promise<UserResponseDto> {
    return await this.userService.fetchUserById(user.userId);
  }

  @UseGuards(AuthAtGuard)
  @Get('events')
  @ApiOperation({ summary: 'Fetch user events' })
  @ApiOkResponseCustom(EventResponseDto, true)
  async fetchUserEvents(@User() user: UserAccess): Promise<EventResponseDto[]> {
    return await this.userService.fetchUserEvents(user.userId);
  }
}
