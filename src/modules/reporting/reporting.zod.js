import { z } from "zod";

const objectIdValidator = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");
const reasonValidator = z.enum([
  "spam",
  "harassment",
  "inappropriate",
  "threats",
  "other",
]);
const detailsValidator = z.string().trim().max(1000).optional();
const paginationValidator = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createMessageReportValidator = z.object({
  params: z.object({ messageId: objectIdValidator }),
  body: z.object({ reason: reasonValidator, details: detailsValidator }),
});

export const createUserReportValidator = z.object({
  params: z.object({ userId: objectIdValidator }),
  body: z.object({ reason: reasonValidator, details: detailsValidator }),
});

export const getReportsValidator = z.object({
  query: paginationValidator,
});

export const adminReportsValidator = z.object({
  query: paginationValidator.extend({
    status: z
      .enum(["pending", "reviewing", "resolved", "dismissed"])
      .optional(),
  }),
});

export const updateReportValidator = z.object({
  params: z.object({ reportId: objectIdValidator }),
  body: z.object({
    status: z.enum(["reviewing", "resolved", "dismissed"]),
    action: z
      .enum(["none", "warning", "content_removed", "account_restricted"])
      .default("none"),
    adminNote: z.string().trim().max(1000).optional(),
  }),
});
