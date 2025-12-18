import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { env } from '@config/envs/env.validation';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AccessTokenPayload } from '../../domain/tokens/access.token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.accessToken,
        (req: Request) => req?.cookies?.refreshToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: env.TOKEN_ACCESS_SECRET,
    });
  }

  async validate(payload: AccessTokenPayload) {
    const { sub } = payload;
    const user = await this.userRepository.findOneById(sub, {
      relations: ['accounts'],
    });

    if (!user) throw new UnauthorizedException('User not found');

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl ?? user.accounts[0]?.providerAvatarUrl ?? null,
      role: user.role,
    };
  }
}
