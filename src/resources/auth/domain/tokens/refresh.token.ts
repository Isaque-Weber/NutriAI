import { BaseToken } from '@shared/abstractions/token/base.token';
import { env } from '@config/envs/env.validation';

export type RefreshTokenPayload = {
  sub: string;
};

export type RefreshTokenFactory = {
  sign(payload: RefreshTokenPayload): string;
  verify(token: string): RefreshTokenPayload;
};

export const REFRESH_TOKEN = Symbol('REFRESH_TOKEN');

export const RefreshTokenProvider = {
  provide: REFRESH_TOKEN,
  useFactory: (): RefreshTokenFactory => {
    class RefreshToken extends BaseToken<RefreshTokenPayload> {
      constructor() {
        super(env.TOKEN_REFRESH_SECRET, {
          expiresIn: env.TOKEN_REFRESH_EXPIRES_IN,
        });
      }
    }

    const token = new RefreshToken();

    return {
      sign: (payload) => token.sign(payload),
      verify: (jwt) => token.verify(jwt),
    };
  },
};
