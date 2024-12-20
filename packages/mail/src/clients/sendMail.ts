import { MailDataRequired } from '@sendgrid/mail';
import { BaseClient } from './baseClient';

export class SendMail extends BaseClient {
  constructor() {
    super();
  }

  async sendMailing(
    data: MailDataRequired | MailDataRequired[],
    isMultiple?: boolean
  ): Promise<any> {
    if (process.env.NODE_ENV === 'TEST') {
      return new Promise<any>((resolve) => {
        setTimeout(resolve, 0);
      });
    }

    const response = await this.post(data, isMultiple);

    return response;
  }
}
