import bcrypt from 'bcrypt';
import { boolean } from 'drizzle-orm/gel-core';
import { PassThrough } from 'stream';


export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Adjust for security/performance balance
  return bcrypt.hash(password, saltRounds);
}

export async function verifyHashPassword(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}