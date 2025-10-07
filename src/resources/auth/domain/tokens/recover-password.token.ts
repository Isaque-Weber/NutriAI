import { env } from '../../../../@config/envs/env.config';
import { BaseToken } from '../../../../@shared/abstractions/token/base.token';

export type RecoverPasswordTokenPayload = {
  sub: string;
  email: string;
};

class RecoverPasswordTokenFactory extends BaseToken<RecoverPasswordTokenPayload> {
  constructor() {
    super(env.TOKEN_RECOVER_PASSWORD_SECRET, {
      expiresIn: Number(env.TOKEN_ACCESS_EXPIRES_IN),
    });
  }

  static create() {
    return new RecoverPasswordTokenFactory();
  }
}

export const RecoverPasswordToken = RecoverPasswordTokenFactory.create();
