import { config } from "dotenv";
import { resolve } from "node:path";
import { envSchema } from "./env.schema.js";
import { z } from "zod";

const nodeEnv = process.env.NODE_ENV || "development";

const envFiles = {
  development: ".env.development",
  production: ".env.production",
};

const envFile = envFiles[nodeEnv];

if (!envFile) {
  throw new Error(
    `Invalid NODE_ENV: ${nodeEnv} , Expected: development or production`,
  );
}

const result = config({
  path: resolve(process.cwd(), "config", envFile),
});

if (result.error) {
  throw new Error(`Failed to load environment file: ${envFile}`, {
    cause: result.error,
  });
}

const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  API_PREFIX: process.env.API_PREFIX,
  TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
});

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(z.prettifyError(parsedEnv.error));

  process.exit(1);
}

export const {
  NODE_ENV,
  PORT,
  API_PREFIX,
  TRUSTED_ORIGINS,
  MONGO_URI,
  MONGO_DB_NAME,
  JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
} = parsedEnv.data;
