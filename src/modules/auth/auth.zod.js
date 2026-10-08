import { z } from "zod";
import {
  ageValidator,
  bioValidator,
  emailValidator,
  genderValidator,
  nameValidator,
  passwordValidator,
  profileImageValidator,
  userNameValidator,
} from "../../utils/validation/Validators.js";

export const UserRegisterValidator = z.object({
  body: z.object({
    userName: userNameValidator,
    firstName: nameValidator,
    lastName: nameValidator,
    email: emailValidator,
    password: passwordValidator,
    age: ageValidator,
    gender: genderValidator,
    profileImage: profileImageValidator.optional(),
    bio: bioValidator.optional(),
  }),
});

export const updateProfileValidator = z.object({
  body: z.object({
    firstName: nameValidator.optional(),
    lastName: nameValidator.optional(),
    gender: genderValidator.optional(),
    age: ageValidator.optional(),
    bio: bioValidator.optional(),
  }),
});

export const loginValidator = z.object({
  body: z.object({ email: emailValidator, password: passwordValidator }),
});
