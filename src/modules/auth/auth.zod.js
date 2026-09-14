import { z } from "zod";
import {
  nameValidator,
  passwordValidator,
} from "../../utils/globalValidator.js";

export const UserRegisterValidator = z
  .object({
    firstName: nameValidator,
    lastName: nameValidator,
    email: z.email({
      error: "Invalid email address",
    }),
    password: passwordValidator,
    age: z.coerce
      .number()
      .int()
      .min(18, "You must be at least 18 years old")
      .max(100, "You must be at most 100 years old"),
    gender: z.enum(["male", "female", "n/a"]).default("n/a"),
    profileImage: z.coerce.string().url().optional(),
    bio: z.coerce
      .string()
      .max(500, "Bio must be at most 500 characters long")
      .optional(),
  })
  .transform((data) => ({
    ...data,
    fullName: `${data.firstName} ${data.lastName}`,
  }));

export const updateProfileValidator = z.object({
  firstName: nameValidator.optional(),
  lastName: nameValidator.optional(),
  gender: z.enum(["male", "female", "n/a"]).optional(),
  age: z.number().min(18).max(100).optional(),
});

export const loginValidator = z.object({
  email: z.email({
    error: "Invalid email address",
  }),
  password: z.string().min(8),
});
