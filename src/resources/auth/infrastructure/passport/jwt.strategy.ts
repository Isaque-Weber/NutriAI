import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { env } from '../../../../@config/envs/env.config';
import { UserRepository } from '../../domain/repositories/user.repository';
import { OrganizationMemberRepository } from '../../../organizations/domain/repositories/organization-member.repository';
import { AccessTokenPayload } from '../../domain/tokens/access.token';
import { Organization } from '../../../organizations/domain/entities/organization.entity';
import {
  OrganizationMember,
  OrganizationRole,
} from '../../../organizations/domain/entities/organization-member.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly organizationMemberRepository: OrganizationMemberRepository,
  ) {
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
    const { sub, organizationId } = payload;
    const user = await this.userRepository.findOneById(sub, {
      relations: [
        'accounts',
        'organizationMember',
        'organizationMember.organization',
      ],
    });

    if (!user) throw new UnauthorizedException('User not found');

    const memberships = user.organizationMember ?? [];

    if (
      organizationId &&
      !memberships.some((m) => m.organizationId === organizationId)
    ) {
      throw new UnauthorizedException('User not found in organization');
    }

    const organizationDefaultId = memberships.find(
      (m) => m.selected,
    )?.organizationId;
    const organizationIdActive =
      organizationDefaultId ??
      organizationId ??
      memberships[0]?.organizationId ??
      null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      avatarUrl: user.avatarUrl ?? user.accounts[0]?.providerAvatarUrl ?? null,
      preferences: user.preferences,
      organizations: memberships.map((m) => m.organization),
      organizationId: organizationIdActive,
    };
  }
}
