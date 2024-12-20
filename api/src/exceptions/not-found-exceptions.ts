import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor() {
    super('User not found');
  }
}

export class EventNotFoundException extends NotFoundException {
  constructor() {
    super('Event not found');
  }
}
