import { z } from "zod";

const nameValidator = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters long")
  .max(20, "Name must be at most 20 characters long")
  .regex(/^[a-zA-Z]+$/, "Name must contain only letters")
  .transform(
    (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
  );

const passwordValidator = z
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
