import jwt, { SignOptions } from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';

export abstract class BaseToken<Payload> {
  private readonly secret: string;
  private readonly options: SignOptions;

  protected constructor(secret: string, options?: SignOptions) {
    this.secret = secret;
    this.options = options || {};
  }

  generateToken(payload: Payload): string {
    return jwt.sign(payload as object, this.secret, this.options);
  }

  verifyToken(token: string): Payload {
    try {
      return jwt.verify(token, this.secret) as Payload;
    } catch {
      throw new UnauthorizedException();
    }
  }

  public sign(payload: Payload): string {
    // implementação real (jsonwebtoken, jose, etc)
    return 'jwt';
  }

  public verify(token: string): Payload {
    // implementação real
    return {} as Payload;
  }

  decodeToken(token: string): Payload {
    try {
      return jwt.decode(token) as Payload;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
