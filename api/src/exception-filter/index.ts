import {
  Catch,
  ArgumentsHost,
  ExceptionFilter as NestExceptionFilter,
} from '@nestjs/common';
import { getErrorMessage } from '@kata/helpers';

@Catch()
export class ExceptionFilter implements NestExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(err: any, host: ArgumentsHost) {
    try {
      const type = host.getType();
      const message = getErrorMessage(err);

      switch (type) {
        case 'http': {
          const response = host.switchToHttp().getResponse();
          const status = err.status ? err.status : 500;

          const sentMessage = message
            ? message
            : 'Une erreur est survenue. Si le problème persiste, contactez l’assistance Kata : support@kata.fr';

          response.status(status).send({
            success: err.success,
            message: sentMessage,
          });
          break;
        }
        default:
          throw new Error(`host ${type} not found`);
      }
    } catch (error) {
      console.error('ERROR in ExceptionFilter', error);
      throw error;
    }
  }
}
