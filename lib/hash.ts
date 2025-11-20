import bcrypt from "bcryptjs";

export async function hashPwd(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export function comparePwd(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}
