import argon2 from "argon2";

export const hash = async (input) => {
  return argon2.hash(input);
};

export const verifyHash = async (hash, input) => {
  return argon2.verify(hash, input);
};
