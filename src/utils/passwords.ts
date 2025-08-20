import { compare, hash } from 'bcryptjs';

async function saltAndHashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hashedPassword = await hash(password, saltRounds);
  return hashedPassword;
}

async function compareHashedPasswords(credentialsPassword: string, userPassword: string): Promise<boolean> {
  const hashedPasswords = await compare(String(credentialsPassword), userPassword);
  return hashedPasswords;
}

export { saltAndHashPassword, compareHashedPasswords };