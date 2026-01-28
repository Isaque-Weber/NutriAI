import { registerAs } from '@nestjs/config';

import { env } from '../envs/env.validation';

export default registerAs('jwt', () => ({
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  refreshSecret: env.JWT_REFRESH_SECRET,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
}));
