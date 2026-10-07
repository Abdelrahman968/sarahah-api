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
});

export const loginValidator = z.object({
  email: emailValidator,
  password: passwordValidator,
});
