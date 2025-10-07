import { randomInt } from 'crypto';

export function generateCodeWith4DigitsUtil() {
  return randomInt(1000, 9999).toString();
}
