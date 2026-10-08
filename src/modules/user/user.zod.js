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
  body: z.object({
    firstName: nameValidator.optional(),
    lastName: nameValidator.optional(),
    gender: genderValidator.optional(),
    age: ageValidator.optional(),
    bio: bioValidator.optional(),
  }),
});

export const updateEmailValidator = z.object({
  email: emailValidator,
});

export const updatePasswordValidator = z
  .object({
    body: z.object({
      currentPassword: passwordValidator,
      newPassword: passwordValidator,
      confirmPassword: passwordValidator,
    }),
  })
  .superRefine(({ body }, ctx) => {
    if (body.newPassword !== body.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "confirmPassword"],
        message: "Passwords do not match",
      });
    }

    if (body.currentPassword === body.newPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["body", "newPassword"],
        message: "New password must be different from current password",
      });
    }
  });

export const forgotPasswordValidator = z.object({
  body: z.object({
    email: emailValidator,
  }),
});

export const resetPasswordValidator = z
  .object({
    body: z.object({
      token: tokenValidator,
      newPassword: passwordValidator,
      confirmPassword: passwordValidator,
    }),
  })
  .refine(({ body }) => body.newPassword === body.confirmPassword, {
    message: "Passwords do not match",
    path: ["body", "confirmPassword"],
  });
