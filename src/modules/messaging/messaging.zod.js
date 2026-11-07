import { z } from "zod";

const objectIdValidator = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");
const contentValidator = z.string().trim().min(1).max(2000);
const paginationValidator = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const sendMessageValidator = z.object({
  body: z.object({
    receiverId: objectIdValidator,
    content: contentValidator,
  }),
});

export const receivedMessagesValidator = z.object({
  query: paginationValidator,
});

export const requestIdentityValidator = z.object({
  params: z.object({ messageId: objectIdValidator }),
});

export const identityRequestsValidator = z.object({
  query: paginationValidator,
});

export const updateIdentityRequestValidator = z.object({
  params: z.object({ requestId: objectIdValidator }),
  body: z.object({ status: z.enum(["accepted", "rejected"]) }),
});

export const conversationMessagesValidator = z.object({
  params: z.object({ conversationId: objectIdValidator }),
  query: paginationValidator,
});

export const conversationsValidator = z.object({
  query: paginationValidator,
});

export const sendConversationMessageValidator = z.object({
  params: z.object({ conversationId: objectIdValidator }),
  body: z.object({ content: contentValidator }),
});

export const messageIdValidator = z.object({
  params: z.object({ id: objectIdValidator }),
});

export const conversationIdValidator = z.object({
  params: z.object({ id: objectIdValidator }),
});
