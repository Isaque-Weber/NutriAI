import { env } from '@config/envs/env.validation';
import { BaseToken } from '@shared/abstractions/token/base.token';

export type RecoverPasswordTokenPayload = {
  sub: string;
  email: string;
};

export type RecoverPasswordTokenFactory = {
  sign(payload: RecoverPasswordTokenPayload): string;
  verify(token: string): RecoverPasswordTokenPayload;
};

export const RECOVER_PASSWORD_TOKEN = Symbol('RECOVER_PASSWORD_TOKEN');

export const RecoverPasswordTokenProvider = {
  provide: RECOVER_PASSWORD_TOKEN,
  useFactory: (): RecoverPasswordTokenFactory => {
    class RecoverPasswordToken extends BaseToken<RecoverPasswordTokenPayload> {
      constructor() {
        super(env.TOKEN_RECOVER_PASSWORD_SECRET, {
          expiresIn: Number(env.TOKEN_ACCESS_EXPIRES_IN),
        });
      }
    }

    const token = new RecoverPasswordToken();

    return {
      sign: (payload) => token.sign(payload),
      verify: (jwt) => token.verify(jwt),
    };
  },
};
