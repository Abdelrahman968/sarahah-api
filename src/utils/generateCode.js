import crypto from "node:crypto";
import { CODE_CHARACTERS } from "../../config/env.config.js";

const generateCode = (length = 6) => {
  const characters = CODE_CHARACTERS;

  return Array.from({ length }, () => {
    return characters[crypto.randomInt(0, characters.length)];
  }).join("");
};

export default generateCode;
