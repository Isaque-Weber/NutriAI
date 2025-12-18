import { env } from '@config/envs/env.validation';
import { BaseToken } from '@shared/abstractions/token/base.token';

export type AccessTokenPayload = {
  sub: string;
  organizationId: string | null;
};

class AccessTokenFactory extends BaseToken<AccessTokenPayload> {
  constructor() {
    super(env.TOKEN_ACCESS_SECRET, {
      expiresIn: Number(env.TOKEN_ACCESS_EXPIRES_IN),
    });
  }

  static create() {
    return new AccessTokenFactory();
  }
}

export const AccessToken = AccessTokenFactory.create();

// Middleware de autenticação -> Verificar se as permissões atuais são iguais as permissões do JWT.
//     Se for diferente, retornar 401 -> refresh token do frontend.
//     Se for igual, continuar.
