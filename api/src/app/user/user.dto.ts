import { ApiProperty } from '@nestjs/swagger';
import { UserReturn } from '@kata/typings';

export class UserResponseDto implements UserReturn {
  @ApiProperty()
  user_id!: string;

  @ApiProperty()
  firstname!: string;

  @ApiProperty()
  lastname!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  created_at!: Date;
}
