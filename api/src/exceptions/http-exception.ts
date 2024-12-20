import { HttpException } from '@nestjs/common';

export class EventParticipantsConflictsException extends HttpException {
  constructor() {
    super('Il y a des conflits pour certains utilisateurs', 400);
  }
}
