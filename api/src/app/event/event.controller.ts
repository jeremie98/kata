import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { AuthAtGuard, EventParticipantGuard } from 'src/guards';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponseCustom } from 'src/utils/swagger';
import {
  EventResponseDto,
  CreateUpdateEventDto,
  AddRemoveParticipantsDto,
  DetectScheduleConflictsParamsDto,
  DetectScheduleConflictsResponseDto,
} from './event.dto';

@Controller('events')
@ApiTags('Event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(AuthAtGuard)
  @UseGuards(EventParticipantGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Fetch one by id' })
  @ApiOkResponseCustom(EventResponseDto)
  async fetchOneById(@Param('id') id: string): Promise<EventResponseDto> {
    return await this.eventService.fetchOneById(id);
  }

  @UseGuards(AuthAtGuard)
  @Post()
  @ApiOperation({ summary: 'Create event' })
  @ApiOkResponseCustom(EventResponseDto)
  async createEvent(
    @Body() createDto: CreateUpdateEventDto
  ): Promise<EventResponseDto> {
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
  @Post(':id/participants')
  @ApiOperation({ summary: 'Add participants to an event' })
  @ApiOkResponseCustom(EventResponseDto)
  async addParticipants(
    @Param('id') idEvent: string,
    @Body() addDto: AddRemoveParticipantsDto
  ): Promise<EventResponseDto> {
    return await this.eventService.addParticipants(idEvent, addDto);
  }

  @UseGuards(AuthAtGuard)
  @UseGuards(EventParticipantGuard)
  @Delete(':id/participants')
  @ApiOperation({ summary: 'Remove participants to an event' })
  @ApiOkResponseCustom(EventResponseDto)
  async removeParticipants(
    @Param('id') idEvent: string,
    @Body() removeDto: AddRemoveParticipantsDto
  ): Promise<EventResponseDto> {
    return await this.eventService.removeParticipants(idEvent, removeDto);
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
}
