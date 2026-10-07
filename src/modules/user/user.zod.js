import { z } from "zod";
import {
  ageValidator,
  bioValidator,
  emailValidator,
  genderValidator,
  nameValidator,
  passwordValidator,
  tokenValidator,
} from "../../utils/validation/Validators.js";

export const updateProfileValidator = z.object({
  firstName: nameValidator.optional(),
  lastName: nameValidator.optional(),
  gender: genderValidator.optional(),
  age: ageValidator.optional(),
  bio: bioValidator.optional(),
});

export const updateEmailValidator = z.object({
  email: emailValidator,
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
  email: emailValidator,
});

export const resetPasswordValidator = z
  .object({
    token: tokenValidator,
    newPassword: passwordValidator,
    confirmPassword: passwordValidator,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
