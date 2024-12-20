import sgMail from '@sendgrid/mail';

export class BaseClient {
  private static instance: BaseClient | null;
  key: string = process.env.SENDGRID_API_KEY as string;

  constructor() {
    if (!BaseClient.instance) {
      BaseClient.instance = this;
    }

    // Import .env file if in development
    if (process.env.NODE_ENV === 'DEV') {
      require('dotenv').config({ path: __dirname + '/../.env' });
    }
    // Check if all required environment variables are defined
    if (process.env.NODE_ENV !== 'TEST' && !process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not defined');
    }

    sgMail.setApiKey(this.key);

    return this;
  }

  async post(
    data: sgMail.MailDataRequired | sgMail.MailDataRequired[],
    isMultiple?: boolean
  ): Promise<[sgMail.ClientResponse, {}]> {
    return sgMail.send(data, isMultiple);
  }
}
