import * as bcrypt from 'bcryptjs';

export type PasswordComparisonPayload = {
  plainPassword: string; // the password the user entered
  hashedPassword: string; // the password stored in DB
};

export const hashedPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const correctPassword = async (
  passwords: PasswordComparisonPayload,
): Promise<boolean> => {
  return bcrypt.compare(passwords.plainPassword, passwords.hashedPassword);
};
