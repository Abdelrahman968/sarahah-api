import { z } from "zod";
import {
  nameValidator,
  passwordValidator,
} from "../../utils/globalValidator.js";

export const updateProfileValidator = z.object({
  firstName: nameValidator.optional(),
  lastName: nameValidator.optional(),
  gender: z.enum(["male", "female", "n/a"]).optional(),
  age: z.number().min(18).max(100).optional(),
  bio: z
    .string()
    .min(1)
    .max(500, "Bio must be less than 500 characters")
    .optional(),
});

export const updateEmailValidator = z.object({
  email: z.email({
    error: "Invalid email address",
  }),
});

export const updatePasswordValidator = z
  .object({
    currentPassword: passwordValidator,
    newPassword: passwordValidator,
    confirmPassword: passwordValidator,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const forgotPasswordValidator = z.object({
  email: z.email({
    error: "Invalid email address",
  }),
});

export const resetPasswordValidator = z
  .object({
    token: z.string().min(1),
    newPassword: passwordValidator,
    confirmPassword: passwordValidator,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
