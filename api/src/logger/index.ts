import { v4 as uuid } from 'uuid';
import dayjs from '@kata/day';

enum Level {
  LOG = 'LOG',
  ERROR = 'ERROR',
  WARN = 'WARN',
  ALERT = 'ALERT',
  DEBUG = 'DEBUG',
  VERBOSE = 'VERBOSE',
}

export class Logger {
  uuid: string = '';

  constructor(
    private readonly context: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly request?: any
  ) {
    if (this.request && this.request.headers && !this.request.headers.uuid)
      this.request.headers.uuid = uuid();
  }

  newUUID = () => {
    this.uuid = uuid();
  };

  log(content: unknown) {
    this.formatLog(content, Level.LOG);
  }

  error(content: unknown) {
    this.formatLog(content, Level.ERROR);
  }

  warn(content: unknown) {
    this.formatLog(content, Level.WARN);
  }

  alert(content: unknown) {
    this.formatLog(content, Level.ALERT);
  }

  debug(content: unknown) {
    this.formatLog(content, Level.DEBUG);
  }

  verbose(content: unknown) {
    this.formatLog(content, Level.VERBOSE);
  }

  private formatLog(content: unknown, level: Level) {
    try {
      if (content instanceof Error) content = content.message ?? content.stack;

      console.log(
        JSON.stringify({
          ...this.addInfos(level),
          content: { log: JSON.stringify(content) },
        })
      );
    } catch (err) {
      console.error('ERROR in Logger', err);
    }
  }

  private addInfos(level: Level) {
    return {
      level,
      uuid:
        this.request?.headers?.uuid ??
        this.request?.data?.headers?.uuid ??
        this.uuid,
      context: this.context,
      date: dayjs().toDate(),
    };
  }
}
