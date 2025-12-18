import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { env } from '@config/envs/env.validation';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { AccountProvider } from '../../domain/entities/account.entity';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
  ) {
    super({
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.GOOGLE_REDIRECT_URI,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { id: googleId, emails, name, photos } = profile;

      if (!emails || emails.length === 0) {
        throw new UnauthorizedException('Email not provided by Google');
      }

      const email = emails[0].value;
      const firstName = name?.givenName || 'Google';
      const lastName = name?.familyName || 'User';
      const picture = photos && photos.length > 0 ? photos[0].value : undefined;

      const account =
        await this.accountRepository.findByProviderAccountId(googleId);
      let user: User | null;

      if (account) {
        user = await this.userRepository.findOneById(account.userId);
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
      } else {
        user = await this.userRepository.findByEmail(email);

        if (!user) {
          user = await this.userRepository.createAndSave({
            firstName,
            lastName,
            email,
          });
        }

        await this.accountRepository.createAndSave({
          provider: AccountProvider.GOOGLE,
          providerAccountId: googleId,
          providerAvatarUrl: picture,
          userId: user!.id,
        });
      }

      done(null, user!);
    } catch (error) {
      done(error, false);
    }
  }
}
