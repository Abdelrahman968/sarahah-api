import { z } from "zod";
import {
  ageValidator,
  bioValidator,
  emailValidator,
  genderValidator,
  nameValidator,
  passwordValidator,
  profileImageValidator,
} from "../../utils/validation/Validators.js";

export const UserRegisterValidator = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .max(20, "Name must be at most 20 characters long")
    .regex(/^[a-zA-Z0-9]+$/, "Name must contain only letters or numbers")
    .transform(
      (value) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
    ),
  firstName: nameValidator,
  lastName: nameValidator,
  email: emailValidator,
  password: passwordValidator,
  age: ageValidator,
  gender: genderValidator,
  profileImage: profileImageValidator.optional(),
  bio: bioValidator.optional(),
});

export const updateProfileValidator = z.object({
  firstName: nameValidator.optional(),
  lastName: nameValidator.optional(),
  gender: genderValidator.optional(),
  age: ageValidator.optional(),
  bio: bioValidator.optional(),
});

export const loginValidator = z.object({
  email: emailValidator,
  password: passwordValidator,
});
