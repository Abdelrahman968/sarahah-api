import { z } from "zod";

export const userNameValidator = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters long")
  .max(20, "Name must be at most 20 characters long")
  .regex(/^[a-zA-Z0-9]+$/, "Name must contain only letters or numbers")
  .transform(
    (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  );

export const nameValidator = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters long")
  .max(20, "Name must be at most 20 characters long")
  .regex(/^[a-zA-Z]+$/, "Name must contain only letters")
  .transform(
    (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  );

export const emailValidator = z.email({
  error: "Invalid email address",
});

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

export const ageValidator = z.coerce
  .number()
  .int()
  .min(18, "You must be at least 18 years old")
  .max(100, "You must be at most 100 years old");

export const genderValidator = z.enum(["male", "female", "n/a"]).default("n/a");

export const bioValidator = z.coerce
  .string()
  .max(500, "Bio must be at most 500 characters long");

export const profileImageValidator = z.coerce.string().url();

export const tokenValidator = z.string().min(1);
