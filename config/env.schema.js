import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce
    .number({
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return "PORT must be a number";
        }

        return "Invalid PORT";
      },
    })
    .int("PORT must be an integer")
    .min(1, "PORT must be at least 1")
    .max(65535, "PORT must be at most 65535")
    .default(7000),
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

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

  JWT_REFRESH_EXPIRES_IN: z.string(),
});
