import { env } from '@config/envs/env.validation';
import { BaseToken } from '@shared/abstractions/token/base.token';

export type AccessTokenPayload = {
  sub: string;
};

export type AccessTokenFactory = {
  sign(payload: AccessTokenPayload): string;
  verify(token: string): AccessTokenPayload;
};

export const ACCESS_TOKEN = Symbol('ACCESS_TOKEN');

export const AccessTokenProvider = {
  provide: ACCESS_TOKEN,
  useFactory: (): AccessTokenFactory => {
    class AccessToken extends BaseToken<AccessTokenPayload> {
      constructor() {
        super(env.TOKEN_ACCESS_SECRET, {
          expiresIn: env.TOKEN_ACCESS_EXPIRES_IN,
        });
      }
    }

    const token = new AccessToken();

    return {
      sign: (payload) => token.sign(payload),
      verify: (jwt) => token.verify(jwt),
    };
  },
};
