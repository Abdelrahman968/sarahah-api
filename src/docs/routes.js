import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export function registerDocsRoutes(registry) {
  registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  registry.registerPath({
    method: "post",
    path: "/blocking/{userId}",
    tags: ["Blocking"],
    summary: "Block User",
    description: "Blocks a user and prevents messaging in either direction.",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ userId: z.string().openapi({ example: "6aac25113c5dde33996e400c" }) }) },
    responses: {
      201: { description: "User blocked." },
      400: { description: "Invalid ID or self block." },
      404: { description: "User not found." },
      409: { description: "User already blocked." },
    },
  });
  registry.registerPath({
    method: "delete",
    path: "/blocking/{userId}",
    tags: ["Blocking"],
    summary: "Unblock User",
    description: "Removes the current user's block for this user.",
    security: [{ bearerAuth: [] }],
    request: { params: z.object({ userId: z.string().openapi({ example: "6aac25113c5dde33996e400c" }) }) },
    responses: {
      200: { description: "User unblocked." },
      400: { description: "Invalid user ID." },
      404: { description: "Block not found." },
    },
  });
  registry.registerPath({
    method: "get",
    path: "/blocking",
    tags: ["Blocking"],
    summary: "List Blocked Users",
    description: "Returns the users blocked by the authenticated user.",
    security: [{ bearerAuth: [] }],
    responses: { 200: { description: "Blocked users retrieved." } },
  });

  registry.registerPath({
    method: "post",
    path: "/reporting/messages/{messageId}",
    tags: ["Reporting"],
    summary: "Report Message",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ messageId: z.string() }),
      body: { content: { "application/json": { schema: z.object({ reason: z.enum(["spam", "harassment", "inappropriate", "threats", "other"]), details: z.string().max(1000).optional() }) } } },
    },
    responses: { 201: { description: "Report created." }, 403: { description: "Only the message receiver can report it." }, 404: { description: "Message not found." } },
  });
  registry.registerPath({
    method: "post",
    path: "/reporting/users/{userId}",
    tags: ["Reporting"],
    summary: "Report User",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({ userId: z.string() }),
      body: { content: { "application/json": { schema: z.object({ reason: z.enum(["spam", "harassment", "inappropriate", "threats", "other"]), details: z.string().max(1000).optional() }) } } },
    },
    responses: { 201: { description: "Report created." }, 400: { description: "Cannot report yourself." }, 404: { description: "User not found." } },
  });
  const reportPaginationQuery = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
  registry.registerPath({ method: "get", path: "/reporting/mine", tags: ["Reporting"], summary: "Get My Reports", security: [{ bearerAuth: [] }], request: { query: reportPaginationQuery }, responses: { 200: { description: "User reports and their statuses." } } });
  registry.registerPath({ method: "get", path: "/admin/reports", tags: ["Admin"], summary: "List Reports", security: [{ bearerAuth: [] }], request: { query: reportPaginationQuery.extend({ status: z.enum(["pending", "reviewing", "resolved", "dismissed"]).optional() }) }, responses: { 200: { description: "Reports retrieved." } } });
  registry.registerPath({ method: "get", path: "/admin/reports/{reportId}", tags: ["Admin"], summary: "Get Report Details", security: [{ bearerAuth: [] }], request: { params: z.object({ reportId: z.string() }) }, responses: { 200: { description: "Report details retrieved." }, 404: { description: "Report not found." } } });
  registry.registerPath({ method: "patch", path: "/admin/reports/{reportId}", tags: ["Admin"], summary: "Review Report", description: "Records review status, outcome action, and an optional admin note.", security: [{ bearerAuth: [] }], request: { params: z.object({ reportId: z.string() }), body: { content: { "application/json": { schema: z.object({ status: z.enum(["reviewing", "resolved", "dismissed"]), action: z.enum(["none", "warning", "content_removed", "account_restricted"]).default("none"), adminNote: z.string().max(1000).optional() }) } } } }, responses: { 200: { description: "Report updated." }, 404: { description: "Report not found." } } });

  // System
  registry.registerPath({
    method: "get",
    path: "/system/health",
    tags: ["System"],
    summary: "Check API health",
    description:
      "Returns the current status of the API and database connection.",
    responses: {
      200: {
        description: "API and database are healthy.",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean().openapi({ example: true }),
              message: z
                .string()
                .openapi({ example: "API is healthy and running" }),
              services: z.object({
                api: z.string().openapi({ example: "up" }),
                database: z.string().openapi({ example: "up" }),
              }),
              uptime: z.string().openapi({ example: "2h 15m 32s" }),
              timestamp: z.string().datetime(),
            }),
          },
        },
      },

      503: {
        description: "Database is unavailable.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/system/get-users",
    tags: ["System"],
    summary: "Get Users",
    description: "Returns the user list available from the system endpoint.",
    responses: {
      200: {
        description: "Users retrieved successfully.",
      },
    },
  });

  // Auth
  registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["Auth"],
    summary: "Register",
    description: "Register a new user account.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              userName: z.string().openapi({ example: "sarahah_user" }),
              firstName: z.string().openapi({ example: "Sarahah" }),
              lastName: z.string().openapi({ example: "User" }),
              email: z.email().openapi({ example: "user@example.com" }),
              password: z.string().openapi({ example: "YourPassword123!" }),
              gender: z.enum(["male", "female"]).openapi({ example: "male" }),
              age: z.number().int().openapi({ example: 23 }),
            }),
          },
        },
      },
    },

    responses: {
      201: {
        description: "Account created successfully.",
      },
      400: {
        description: "Validation error.",
      },
      409: {
        description: "Email already registered.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["Auth"],
    summary: "Login",
    description: "Log in with either a username or an email address and password.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              userName: z
                .string()
                .optional()
                .openapi({ example: "sarahah_user" }),
              email: z.email().optional().openapi({
                example: "user@example.com",
              }),
              password: z.string().openapi({ example: "YourPassword123!" }),
            }),
          },
        },
      },
    },

    responses: {
      200: {
        description: "Logged in successfully.",
      },
      401: {
        description: "Invalid credentials.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/refresh-token",
    tags: ["Auth"],
    summary: "Refresh Token",
    description:
      "Uses the refresh token stored in the HttpOnly cookie to issue a new access token.",
    responses: {
      200: {
        description: "Access token refreshed successfully.",
      },
      401: {
        description: "Refresh token is missing or invalid.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/logout",
    tags: ["Auth"],
    summary: "Logout",
    description: "Revokes the refresh token stored in the cookie.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Logged out successfully.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/profile",
    tags: ["Auth"],
    summary: "Get Authenticated Profile",
    description: "Returns the profile for the authenticated user.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Profile retrieved successfully.",
      },
      401: {
        description: "Unauthorized.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/activate-request",
    tags: ["Auth"],
    summary: "Request Email Activation Code",
    description: "Sends an email verification code to the authenticated user.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Activation code sent.",
      },
      401: {
        description: "Unauthorized.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/activate-email",
    tags: ["Auth"],
    summary: "Verify Email",
    description: "Verifies the authenticated user's email with an OTP code.",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              otp: z.string().openapi({ example: "123456" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Email verified successfully.",
      },
      400: {
        description: "Invalid or expired code.",
      },
      401: {
        description: "Unauthorized.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/set-password",
    tags: ["Auth"],
    summary: "Set Password for OAuth Account",
    description: "Set a password for the authenticated OAuth account.",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z
              .object({
                password: z.string().openapi({ example: "YourPassword123!" }),
                confirmPassword: z
                  .string()
                  .openapi({ example: "YourPassword123!" }),
              })
              .refine((body) => body.password === body.confirmPassword, {
                message: "Passwords do not match",
                path: ["confirmPassword"],
              }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Password set successfully.",
      },
      401: {
        description: "Unauthorized.",
      },
      409: {
        description: "Password is already set.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/google",
    tags: ["Auth"],
    summary: "Google Auth",
    description: "Redirects to Google to authenticate the user.",
    responses: {
      302: {
        description: "Redirect to Google OAuth.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/github",
    tags: ["Auth"],
    summary: "GitHub Auth",
    description: "Redirects to GitHub to authenticate the user.",
    responses: {
      302: {
        description: "Redirect to GitHub OAuth.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/google/callback",
    tags: ["Auth"],
    summary: "Google OAuth Callback",
    description:
      "Completes Google OAuth login using the authorization code returned by Google.",
    request: {
      query: z.object({
        code: z.string().openapi({ example: "google-authorization-code" }),
      }),
    },
    responses: {
      200: {
        description: "Google login completed successfully.",
      },
      400: {
        description: "Google authorization code is missing or invalid.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/github/callback",
    tags: ["Auth"],
    summary: "GitHub OAuth Callback",
    description:
      "Completes GitHub OAuth login using the authorization code returned by GitHub.",
    request: {
      query: z.object({
        code: z.string().openapi({ example: "github-authorization-code" }),
      }),
    },
    responses: {
      200: {
        description: "GitHub login completed successfully.",
      },
      400: {
        description: "GitHub authorization code is missing or invalid.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/2fa-enable",
    tags: ["Auth"],
    summary: "Enable Two-Factor Authentication",
    description: "Generates a two-factor authentication setup code.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Two-factor setup code generated.",
      },
      401: {
        description: "Unauthorized.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/2fa-verify",
    tags: ["Auth"],
    summary: "Verify Two-Factor Setup",
    description: "Verifies the OTP and enables two-factor authentication.",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              otp: z.string().openapi({ example: "123456" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Two-factor authentication enabled.",
      },
      400: {
        description: "Invalid or expired OTP.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/auth/2fa-disable",
    tags: ["Auth"],
    summary: "Disable Two-Factor Authentication",
    description: "Disables two-factor authentication for the current user.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Two-factor authentication disabled.",
      },
      401: {
        description: "Unauthorized.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/login/verify-2fa",
    tags: ["Auth"],
    summary: "Verify Login Two-Factor Code",
    description: "Completes a login that requires two-factor authentication.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              challenge: z.string().openapi({ example: "login-challenge" }),
              otp: z.string().openapi({ example: "123456" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login completed successfully.",
      },
      401: {
        description: "Invalid or expired login challenge.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/resend-otp",
    tags: ["Auth"],
    summary: "Resend OTP",
    description: "Resends an active email verification or 2FA OTP.",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              otpType: z
                .enum(["email-verification", "two-factor-setup"])
                .openapi({ example: "email-verification" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "OTP resend request processed.",
      },
      401: {
        description: "Unauthorized.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/forgot-password",
    tags: ["Auth"],
    summary: "Forgot Password",
    description: "Sends a password reset token to the user's email.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z.email().openapi({ example: "user@example.com" }),
            }),
          },
        },
      },
    },

    responses: {
      200: {
        description: "Reset token sent if the email exists.",
      },
      404: {
        description: "Email not found.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/reset-password",
    tags: ["Auth"],
    summary: "Reset Password",
    description: "Resets the password using the token received by email.",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              token: z.string().openapi({ example: "reset-token-from-email" }),
              newPassword: z
                .string()
                .openapi({ example: "YourNewPassword123!" }),
              confirmPassword: z
                .string()
                .openapi({ example: "YourNewPassword123!" }),
            }),
          },
        },
      },
    },

    responses: {
      200: {
        description: "Password reset successfully.",
      },
      400: {
        description: "Invalid or expired token.",
      },
    },
  });

  // Users
  const paginationQuery = z.object({
    page: z.coerce.number().int().min(1).max(1_000_000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  });
  const messageParams = z.object({
    messageId: z.string().openapi({ example: "6aac25113c5dde33996e4010" }),
  });

  registry.registerPath({
    method: "post",
    path: "/messaging/messages",
    tags: ["Messaging"],
    summary: "Send Anonymous Message",
    description: "Sends a text message without exposing the sender identity.",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              receiverId: z.string().openapi({ example: "6aac25113c5dde33996e400c" }),
              content: z.string().min(1).max(2000).openapi({ example: "Hello!" }),
            }),
          },
        },
      },
    },
    responses: {
      201: { description: "Anonymous message sent." },
      400: { description: "Invalid input or self-message." },
      404: { description: "Receiver not found." },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/messaging/messages/received",
    tags: ["Messaging"],
    summary: "Get Received Anonymous Messages",
    description: "Returns received messages without sender identities.",
    security: [{ bearerAuth: [] }],
    request: { query: paginationQuery },
    responses: { 200: { description: "Messages retrieved." } },
  });

  registry.registerPath({ method: "get", path: "/messaging/messages/sent", tags: ["Messaging"], summary: "Get Sent Messages", description: "Returns the authenticated user's anonymous messages.", security: [{ bearerAuth: [] }], request: { query: paginationQuery }, responses: { 200: { description: "Sent messages retrieved." } } });
  registry.registerPath({ method: "delete", path: "/messaging/messages/{id}", tags: ["Messaging"], summary: "Delete Sent Message", description: "Deletes a message owned by the authenticated sender.", security: [{ bearerAuth: [] }], request: { params: z.object({ id: z.string() }) }, responses: { 200: { description: "Message deleted." }, 404: { description: "Message not found." } } });
  registry.registerPath({ method: "get", path: "/messaging/conversations/{id}", tags: ["Messaging"], summary: "Get Conversation", description: "Returns conversation details to a participant.", security: [{ bearerAuth: [] }], request: { params: z.object({ id: z.string() }) }, responses: { 200: { description: "Conversation retrieved." }, 404: { description: "Conversation not found." } } });
  registry.registerPath({ method: "patch", path: "/messaging/conversations/{id}/read", tags: ["Messaging"], summary: "Mark Conversation Read", description: "Marks this conversation read for the current participant.", security: [{ bearerAuth: [] }], request: { params: z.object({ id: z.string() }) }, responses: { 200: { description: "Conversation marked read." }, 404: { description: "Conversation not found." } } });
  registry.registerPath({ method: "delete", path: "/messaging/conversations/{id}", tags: ["Messaging"], summary: "Hide Conversation", description: "Hides this conversation for the current participant.", security: [{ bearerAuth: [] }], request: { params: z.object({ id: z.string() }) }, responses: { 200: { description: "Conversation hidden." }, 404: { description: "Conversation not found." } } });

  registry.registerPath({
    method: "post",
    path: "/messaging/messages/{messageId}/identity-requests",
    tags: ["Messaging"],
    summary: "Request Message Sender Identity",
    description: "Requests the identity of the sender of a received message.",
    security: [{ bearerAuth: [] }],
    request: { params: messageParams },
    responses: {
      201: { description: "Identity request created." },
      403: { description: "The message belongs to another receiver." },
      404: { description: "Message not found." },
      409: { description: "A pending or accepted request already exists." },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/messaging/identity-requests",
    tags: ["Messaging"],
    summary: "Get Identity Requests",
    description: "Returns requests for messages sent by the authenticated user.",
    security: [{ bearerAuth: [] }],
    request: { query: paginationQuery },
    responses: { 200: { description: "Identity requests retrieved." } },
  });

  registry.registerPath({
    method: "patch",
    path: "/messaging/identity-requests/{requestId}",
    tags: ["Messaging"],
    summary: "Accept or Reject Identity Request",
    description: "Accepting creates a conversation; rejection keeps identity hidden.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        requestId: z.string().openapi({ example: "6aac25113c5dde33996e4020" }),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({ status: z.enum(["accepted", "rejected"]) }),
          },
        },
      },
    },
    responses: {
      200: { description: "Identity request updated." },
      403: { description: "Request belongs to another sender." },
      404: { description: "Request not found." },
      409: { description: "Request was already processed." },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/messaging/conversations",
    tags: ["Messaging"],
    summary: "Get Conversations",
    description: "Returns conversations and public profiles for their participants.",
    security: [{ bearerAuth: [] }],
    request: { query: paginationQuery },
    responses: { 200: { description: "Conversations retrieved." } },
  });

  registry.registerPath({
    method: "post",
    path: "/messaging/conversations/{conversationId}/messages",
    tags: ["Messaging"],
    summary: "Send Conversation Message",
    description: "Sends a text message as a conversation participant.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        conversationId: z.string().openapi({ example: "6aac25113c5dde33996e4030" }),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({ content: z.string().min(1).max(2000) }),
          },
        },
      },
    },
    responses: {
      201: { description: "Message sent." },
      403: { description: "User is not a participant." },
      404: { description: "Conversation not found." },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/messaging/conversations/{conversationId}/messages",
    tags: ["Messaging"],
    summary: "Get Conversation Messages",
    description: "Returns participant profiles and paginated conversation messages.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        conversationId: z.string().openapi({ example: "6aac25113c5dde33996e4030" }),
      }),
      query: paginationQuery,
    },
    responses: {
      200: { description: "Conversation and messages retrieved." },
      403: { description: "User is not a participant." },
      404: { description: "Conversation not found." },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/user/profile",
    tags: ["Users"],
    summary: "Get Profile",
    description: "Get the currently authenticated user's profile.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Profile retrieved successfully.",
      },
      401: {
        description: "Unauthorized.",
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/user/update-profile",

    tags: ["Users"],

    summary: "Update Profile",

    description: "Update the currently authenticated user's profile info.",

    security: [{ bearerAuth: [] }],

    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              firstName: z.string().optional().openapi({ example: "Ahmed" }),
              lastName: z.string().optional().openapi({ example: "Mohamed" }),
              gender: z
                .enum(["male", "female"])
                .optional()
                .openapi({ example: "male" }),
              age: z.number().int().optional().openapi({ example: 26 }),
              bio: z
                .string()
                .optional()
                .openapi({ example: "Frontend Developer" }),
            }),
          },
        },
      },
    },

    responses: {
      200: {
        description: "Profile updated successfully.",
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/user/update-email",

    tags: ["Users"],

    summary: "Update Email",

    description: "Update the currently authenticated user's email.",

    security: [{ bearerAuth: [] }],

    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z
                .string()
                .email()
                .openapi({ example: "user@example.com" }),
            }),
          },
        },
      },
    },

    responses: {
      200: {
        description: "Email updated successfully.",
      },
      409: {
        description: "Email already in use.",
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/user/update-password",

    tags: ["Users"],

    summary: "Update Password",

    description: "Update the currently authenticated user's password.",

    security: [{ bearerAuth: [] }],

    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              currentPassword: z
                .string()
                .openapi({ example: "YourCurrentPassword123!" }),
              newPassword: z
                .string()
                .openapi({ example: "YourNewPassword123!" }),
              confirmPassword: z
                .string()
                .openapi({ example: "YourNewPassword123!" }),
            }),
          },
        },
      },
    },

    responses: {
      200: {
        description: "Password updated successfully.",
      },
      401: {
        description: "Current password is incorrect.",
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/user/delete/me",
    tags: ["Users"],
    summary: "Delete My Account",
    description: "Delete the currently authenticated user's account.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Account deleted successfully.",
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/user/update-avatar",
    tags: ["Users"],
    summary: "Update Avatar",
    description: "Uploads and updates the authenticated user's avatar image.",
    security: [{ bearerAuth: [] }],
    request: {
      body: {
        content: {
          "multipart/form-data": {
            schema: z.object({
              avatar: z
                .string()
                .openapi({ type: "string", format: "binary" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Avatar updated successfully.",
      },
      400: {
        description: "Invalid or missing image.",
      },
    },
  });

  // Admin
  registry.registerPath({
    method: "delete",
    path: "/admin/delete/user/{id}",
    tags: ["Admin"],
    summary: "Delete User By ID",
    description: "Admin: delete a user by their ID.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({ example: "6aac25113c5dde33996e400c" }),
      }),
    },
    responses: {
      200: {
        description: "User deleted successfully.",
      },
      404: {
        description: "User not found.",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/admin/edit/user/{id}",
    tags: ["Admin"],
    summary: "Update User By ID",
    description: "Admin: update a user's info by their ID.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        id: z.string().openapi({ example: "6aac25113c5dde33996e400c" }),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              userName: z.string().optional().openapi({ example: "ahmed_user" }),
              firstName: z.string().optional().openapi({ example: "Ahmed" }),
              lastName: z.string().optional().openapi({ example: "Mohamed" }),
              email: z
                .email()
                .optional()
                .openapi({ example: "ahmed@example.com" }),
              password: z.string().optional().openapi({ example: "NewPassword123!" }),
              age: z.number().int().min(18).max(100).optional().openapi({ example: 26 }),
              gender: z
                .enum(["male", "female", "n/a"])
                .optional()
                .openapi({ example: "male" }),
              avatar: z.string().url().optional().openapi({
                example: "https://cdn.example.com/avatar.webp",
              }),
              bio: z.string().max(500).optional().openapi({
                example: "Frontend Developer",
              }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "User updated successfully.",
      },
      404: {
        description: "User not found.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/users",
    tags: ["Admin"],
    summary: "Get All Users",
    description: "Admin: retrieve all users.",
    security: [{ bearerAuth: [] }],
    responses: {
      200: {
        description: "Users retrieved successfully.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/user/{userName}",
    tags: ["Admin"],
    summary: "Get User By Username",
    description: "Admin: retrieve a user by their username path parameter.",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        userName: z.string().openapi({ example: "sarahah_user" }),
      }),
    },
    responses: {
      200: {
        description: "User retrieved successfully.",
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/admin/user",
    tags: ["Admin"],
    summary: "Get User By Username",
    description: "Admin: retrieve a user by their username query parameter.",
    security: [{ bearerAuth: [] }],
    request: {
      query: z.object({
        userName: z.string().openapi({ example: "sarahah_user" }),
      }),
    },
    responses: {
      200: {
        description: "User retrieved successfully.",
      },
    },
  });
}
