import { z } from "zod";
import {
  nameValidator,
  passwordValidator,
  userNameValidator,
} from "../../utils/validation/Validators.js";

export const AdminUpdateValidator = z.object({
  body: z.object({
    userName: userNameValidator.optional(),
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
    avatar: z.coerce.string().url().optional(),
    bio: z.coerce
      .string()
      .max(500, "Bio must be at most 500 characters long")
      .optional(),
  }),
});

export const userSearchByUserNameValidator = z
  .object({
    params: z.object({
      userName: userNameValidator.optional(),
    }),
    query: z.object({
      userName: userNameValidator.optional(),
    }),
  })
  .refine(
    ({ params, query }) => Boolean(params.userName) !== Boolean(query.userName),
    {
      message: "Either params or query must be provided, but not both",
      path: ["params", "query"],
    },
  );

export const adminReportsValidator = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).max(1_000_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(["pending", "reviewing", "resolved", "dismissed"]).optional(),
  }),
});

export const adminReportParamsValidator = z.object({
  params: z.object({ reportId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid report ID") }),
});

export const adminReportUpdateValidator = z.object({
  params: z.object({ reportId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid report ID") }),
  body: z.object({
    status: z.enum(["reviewing", "resolved", "dismissed"]),
    action: z.enum(["none", "warning", "content_removed", "account_restricted"]).default("none"),
    adminNote: z.string().trim().max(1000).optional(),
  }),
});
