import { BaseToken } from '../../../../@shared/abstractions/token/base.token';
import { env } from '../../../../@config/envs/env.config';

export type RefreshTokenPayload = {
  sub: string;
  organizationId: string | null;
};

class RefreshTokenFactory extends BaseToken<RefreshTokenPayload> {
  constructor() {
    super(env.TOKEN_REFRESH_SECRET, {
      expiresIn: Number(env.TOKEN_REFRESH_EXPIRES_IN),
    });
  }

  static create() {
    return new RefreshTokenFactory();
  }
}

export const RefreshToken = RefreshTokenFactory.create();
