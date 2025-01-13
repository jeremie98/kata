import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { AuthAtGuard, EventParticipantGuard } from 'src/guards';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCustom } from 'src/utils/swagger';
import {
  EventResponseDto,
  CreateUpdateEventDto,
  DetectScheduleConflictsParamsDto,
  DetectScheduleConflictsResponseDto,
  SuggestFreeCalendarSlotsResponseDto,
} from './event.dto';

@Controller('events')
@ApiTags('Event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(AuthAtGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Fetch one by id' })
  @ApiOkResponseCustom(EventResponseDto)
  async fetchOneById(@Param('id') id: string): Promise<EventResponseDto> {
    return await this.eventService.fetchOneById(id);
  }

  @UseGuards(AuthAtGuard)
  @Get('planning')
  @ApiOperation({ summary: 'Fetch events planning' })
  @ApiOkResponseCustom(EventResponseDto, true)
  async fetchEventsPlanning(
    @Query('dateStart') dateStart: string,
    @Query('dateEnd') dateEnd: string
  ): Promise<EventResponseDto[]> {
    return await this.eventService.fetchEventsPlanning({ dateStart, dateEnd });
  }

  @UseGuards(AuthAtGuard)
  @Post()
  @ApiOperation({ summary: 'Create event' })
  @ApiOkResponseCustom(EventResponseDto)
  async createEvent(
    @Body() createDto: CreateUpdateEventDto
  ): Promise<EventResponseDto | DetectScheduleConflictsResponseDto[]> {
    return await this.eventService.createEvent(createDto);
  }

  @UseGuards(AuthAtGuard)
  @UseGuards(EventParticipantGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiOkResponseCustom(EventResponseDto)
  async updateEvent(
    @Param('id') id: string,
    @Body() updateDto: CreateUpdateEventDto
  ): Promise<EventResponseDto> {
    return await this.eventService.updateEvent(id, updateDto);
  }

  @UseGuards(AuthAtGuard)
  @UseGuards(EventParticipantGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  @ApiOkResponseCustom('boolean', false, true)
  async deleteEvent(@Param('id') id: string): Promise<boolean> {
    return await this.eventService.deleteEvent(id);
  }

  @UseGuards(AuthAtGuard)
  @Post('detect-conflicts')
  @ApiOperation({
    summary: "Detect event's conflicts for a list of participants",
  })
  @ApiOkResponseCustom(DetectScheduleConflictsResponseDto, true)
  async detectScheduleConflicts(
    @Body() conflictDto: DetectScheduleConflictsParamsDto
  ): Promise<DetectScheduleConflictsResponseDto[]> {
    return await this.eventService.detectScheduleConflicts(conflictDto);
  }

  @UseGuards(AuthAtGuard)
  @Post('suggest-free-slots')
  @ApiOperation({
    summary: 'Suggest free slots for a list of participants',
  })
  @ApiOkResponseCustom(SuggestFreeCalendarSlotsResponseDto, true)
  async suggestFreeCalendarSlots(
    @Body() conflictDto: DetectScheduleConflictsParamsDto
  ): Promise<SuggestFreeCalendarSlotsResponseDto[]> {
    return await this.eventService.suggestFreeCalendarSlots(conflictDto);
  }
}
