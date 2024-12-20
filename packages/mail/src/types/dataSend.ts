import { TemplateIdType } from './templateType';

export interface DataSendMail {
  to: string;
  from: string;
  subject?: string;
  templateId: TemplateIdType;
  text?: string;
  html?: string;
}
