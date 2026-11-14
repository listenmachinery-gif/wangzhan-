import { hash, verify, argon2id, type HashOptions } from "argon2";

const passwordOptions: HashOptions = {
  type: argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(password: string) {
  return hash(password, passwordOptions);
}

export function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password);
}
