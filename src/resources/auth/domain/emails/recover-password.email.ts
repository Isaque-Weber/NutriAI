import { env } from '../../../../@config/envs/env.config';
import { BaseEmail } from '../../../../@shared/abstractions/email/base.email';

export type RecoverPasswordTemplateData = {
  username: string;
  email: string;
  token: string;
  frontend_url: string;
};

class RecoverPasswordEmailFactory extends BaseEmail<RecoverPasswordTemplateData> {
  constructor() {
    super(env.SENDGRID_TEMPLATE_RECOVER_PASSWORD);
  }

  static create() {
    return new RecoverPasswordEmailFactory();
  }
}

export const RecoverPasswordEmail = RecoverPasswordEmailFactory.create();
