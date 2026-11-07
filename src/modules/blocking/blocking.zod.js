import { z } from "zod";

export const blockUserValidator = z.object({
  params: z.object({ userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID") }),
});
