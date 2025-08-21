import { compare } from 'bcryptjs';


async function compareHashedPasswords(credentialsPassword: string, userPassword: string): Promise<boolean> {
  const hashedPasswords = await compare(String(credentialsPassword), userPassword);
  return hashedPasswords;
}

export { compareHashedPasswords };