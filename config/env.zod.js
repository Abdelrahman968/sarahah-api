import { z } from "zod";

const portValidator = z.coerce
  .number({
    error: (issue) => {
      if (issue.code === "invalid_type") {
        return "PORT must be a number";
      }

      return "Invalid PORT";
    },
  })
  .int("PORT must be an integer")
  .positive()
  .min(1, "PORT must be at least 1")
  .max(65535, "PORT must be at most 65535")
  .default(7000);

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: portValidator,
  API_PREFIX: z
    .string({ error: "API_PREFIX must be a string" })
    .min(1, "API_PREFIX must be at least 1 character long")
    .default("/api"),

  MONGO_URI: z
    .string()
    .min(1, "MongoDB URI is required")
    .default("mongodb://localhost:27017"),

  MONGO_DB_NAME: z
    .string()
    .min(1, "MongoDB database name is required")
    .default("sarahah_dev"),

  REDIS_URL: z.url().default("redis://localhost:6379"),

  TRUSTED_ORIGINS: z
    .string()
    .transform((value) => {
      return value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    })
    .pipe(z.array(z.url())),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),

  JWT_ACCESS_EXPIRES_IN: z.string(),

  JWT_ADMIN_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ADMIN_ACCESS_SECRET must be at least 32 characters"),

  JWT_ADMIN_ACCESS_EXPIRES_IN: z.string(),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  JWT_REFRESH_EXPIRES_IN: z.string(),

  JWT_ADMIN_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_ADMIN_REFRESH_SECRET must be at least 32 characters"),

  JWT_ADMIN_REFRESH_EXPIRES_IN: z.string(),

  JWT_REFRESH_COOKIE_NAME: z.string(),

  CODE_CHARACTERS: z
    .string()
    .min(10, "CODE_CHARACTERS must be at least 10 characters"),

  OTP_LENGTH: z.coerce.number().min(3).max(10).default(6),
  OTP_EXPIRES_IN: z.coerce.number().min(300).max(3600).default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().min(3).max(10).default(5),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: portValidator,
  SMTP_USER: z.email(),
  SMTP_PASSWORD: z.string().min(1),
  MAIL_FROM: z.string().min(1),
  CLIENT_URL: z.url(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.url(),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_CALLBACK_URL: z.url(),
});
