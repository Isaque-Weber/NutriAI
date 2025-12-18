import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { env } from '@config/envs/env.validation';
import { log } from '../../logging/logger';

export interface SendDynamicTemplateEmailParams<TemplateData> {
  to: string | string[];
  dynamicTemplateData: TemplateData;
}

export abstract class BaseEmail<
  TemplateData extends { [key: string]: any } | undefined,
> {
  private readonly templateId: string;

  protected constructor(templateId: string) {
    sgMail.setApiKey(env.SENDGRID_API_KEY);
    this.templateId = templateId;
  }

  async send(
    params: SendDynamicTemplateEmailParams<TemplateData>,
  ): Promise<void> {
    const { to, dynamicTemplateData } = params;

    log.info(
      `[Email] Enviando email template ${this.templateId} para ${Array.isArray(to) ? to.join(', ') : to}`,
    );

    const senderEmail = env.SENDGRID_FROM_EMAIL;
    const name = env.SENDGRID_FROM_NAME;

    const msg: MailDataRequired = {
      to: to,
      from: { email: senderEmail, name: name },
      templateId: this.templateId,
      dynamicTemplateData: dynamicTemplateData,
    };

    const response = await sgMail.send(msg);
    log.info(
      `[Email] Email enviado com sucesso. Status: ${response[0].statusCode}`,
    );
  }
}
