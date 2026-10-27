import { z } from "zod";
import {
  ageValidator,
  bioValidator,
  emailValidator,
  genderValidator,
  nameValidator,
  passwordValidator,
  avatarValidator,
  userNameValidator,
} from "../../utils/validation/Validators.js";
import { OTP_TYPES } from "../../common/constants/otp.constants.js";

export const UserRegisterValidator = z.object({
  body: z.object({
    userName: userNameValidator,
    firstName: nameValidator,
    lastName: nameValidator,
    email: emailValidator,
    password: passwordValidator,
    age: ageValidator,
    gender: genderValidator,
    avatar: avatarValidator.optional(),
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

export const loginValidator = z
  .object({
    body: z.object({
      userName: userNameValidator.optional(),
      email: emailValidator.optional(),
      password: passwordValidator,
    }),
  })
  .refine(({ body }) => Boolean(body.userName) !== Boolean(body.email), {
    message: "You must provide either a username or an email",
  });

export const setPasswordValidator = z
  .object({
    body: z.object({
      password: passwordValidator,
      confirmPassword: passwordValidator,
    }),
  })
  .refine(({ body }) => body.password === body.confirmPassword, {
    message: "Passwords do not match",
    path: ["body", "confirmPassword"],
  });

export const OtpValidator = z.object({
  body: z.object({
    otp: z.string(),
  }),
});

export const LoginOTPValidator = z.object({
  body: z.object({
    challenge: z.string().min(1),
    otp: z.string().min(1),
  }),
});

export const resendOTPValidator = z.object({
  body: z.object({
    otpType: z.enum([
      OTP_TYPES.EMAIL_VERIFICATION,
      OTP_TYPES.TWO_FACTOR_SETUP,
      OTP_TYPES.TWO_FACTOR_LOGIN,
    ]),
  }),
});
