import { z } from "zod";

export const nameValidator = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters long")
  .max(20, "Name must be at most 20 characters long")
  .regex(/^[a-zA-Z]+$/, "Name must contain only letters")
  .transform(
    (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  );

export const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be at most 128 characters long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one digit")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );
