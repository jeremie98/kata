import {
  $Enums,
  CreateUpdateEventParams,
  DetectScheduleConflictsParams,
  DetectScheduleConflictsResponse,
  SuggestFreeCalendarSlotsResponse,
  type EventReturn,
  type UserReturn,
} from '@kata/typings';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsDate, IsString } from 'class-validator';
import { UserResponseDto } from '../user/user.dto';

export class EventResponseDto implements EventReturn {
  @ApiProperty()
  event_id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  date_start!: Date;

  @ApiProperty()
  date_end!: Date;

  @ApiProperty({ enum: $Enums.EventType })
  type!: $Enums.EventType;

  @ApiProperty({ type: UserResponseDto, isArray: true })
  participants?: UserReturn[];

  @ApiProperty()
  created_at!: Date;

  @ApiProperty()
  updated_at!: Date;
}

export class CreateUpdateEventDto implements CreateUpdateEventParams {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  dateStart!: string;

  @ApiProperty()
  @IsString()
  dateEnd!: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  participantIds!: string[];

  @ApiProperty({ enum: $Enums.EventType })
  @IsString()
  type!: $Enums.EventType;
}

export class DetectScheduleConflictsParamsDto
  implements DetectScheduleConflictsParams
{
  @ApiProperty()
  @IsString()
  dateStart!: string;

  @ApiProperty()
  @IsString()
  dateEnd!: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  participantIds!: string[];
}

export class DetectScheduleConflictsResponseDto
  implements DetectScheduleConflictsResponse
{
  @ApiProperty({ type: UserResponseDto })
  user!: UserReturn;

  @ApiProperty({ type: EventResponseDto, isArray: true })
  conflictingEvents!: EventReturn[];
}

export class SuggestFreeCalendarSlotsResponseDto
  implements SuggestFreeCalendarSlotsResponse
{
  @ApiProperty()
  @IsDate()
  dateStart!: Date;

  @ApiProperty()
  @IsDate()
  dateEnd!: Date;
}
