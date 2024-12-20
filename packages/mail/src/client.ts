import { SendMail } from './clients';

export class SendMailClient {
  private static instance: SendMailClient | null;

  sendMail = new SendMail();

  constructor() {
    if (!SendMailClient.instance) {
      SendMailClient.instance = this;
    }
    return this;
  }
}
