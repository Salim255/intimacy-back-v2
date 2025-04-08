import * as bcrypt from 'bcryptjs';

export const hashedPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const correctPassword = async (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, userPassword);
};
