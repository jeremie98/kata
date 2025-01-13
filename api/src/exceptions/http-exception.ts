import { DetectScheduleConflictsResponse } from '@kata/typings';
import { HttpException, HttpStatus } from '@nestjs/common';

export class EventParticipantsConflictsException extends HttpException {
  constructor(conflictingUsers: DetectScheduleConflictsResponse[]) {
    super(
      {
        message: 'Il y a des conflits pour certains utilisateurs',
        data: conflictingUsers,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

// import { HttpException, HttpStatus } from '@nestjs/common';

// export class EventParticipantsConflictsException extends HttpException {
//   constructor(conflictingUsers: { userId: string; name: string }[]) {
//     super(
//       {
//         statusCode: HttpStatus.BAD_REQUEST,
//         message: 'Il y a des conflits pour certains utilisateurs',
//         conflictingUsers, // Inclure les utilisateurs concernés
//       },
//       HttpStatus.BAD_REQUEST,
//     );
//   }
// }
