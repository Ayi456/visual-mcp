import { randomBytes } from 'crypto';

export class UserUtils {
  static generateAccessId(): string {
    const randomPart = randomBytes(12).toString('hex');
    return `ak_${randomPart}`;
  }

  static generateAccessKey(): string {
    return randomBytes(32).toString('hex');
  }
}
