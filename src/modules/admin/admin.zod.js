import { z } from "zod";
import {
  nameValidator,
  passwordValidator,
} from "../../utils/globalValidator.js";

export const AdminUpdateUserValidator = z.object({
  firstName: nameValidator.optional(),
  lastName: nameValidator.optional(),
  email: z
    .email({
      error: "Invalid email address",
    })
    .optional(),
  password: passwordValidator.optional(),
  age: z.coerce
    .number()
    .int()
    .min(18, "You must be at least 18 years old")
    .max(100, "You must be at most 100 years old")
    .optional(),
  gender: z.enum(["male", "female", "n/a"]).default("n/a").optional(),
  profileImage: z.coerce.string().url().optional(),
  bio: z.coerce
    .string()
    .max(500, "Bio must be at most 500 characters long")
    .optional(),
});
