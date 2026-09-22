import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export function registerDocsRoutes(registry) {
  registry.registerComponent("securitySchemes", "bearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
  });

  // ---------------------------------------------------------------------
  // System
  // ---------------------------------------------------------------------
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

  // ---------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------
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
              firstName: z.string().openapi({ example: "Abdelrahman" }),
              lastName: z.string().openapi({ example: "Ayman" }),
              email: z
                .string()
                .email()
                .openapi({ example: "se.abdelrahman968@gmail.com" }),
              password: z.string().openapi({ example: "Password@123" }),
              gender: z.enum(["male", "female"]).openapi({ example: "male" }),
              age: z.number().int().openapi({ example: 23 }),
            }),
          },
        },
      },
    },

    responses: {
      200: {
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

    description: "Log in with email and password.",

    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              email: z
                .string()
                .email()
                .openapi({ example: "se.abdelrahman968+admin@gmail.com" }),
              password: z.string().openapi({ example: "Password@123" }),
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
    path: "/auth/logout",

    tags: ["Auth"],

    summary: "Logout",

    description: "Revokes the refresh token stored in the cookie.",

    responses: {
      200: {
        description: "Logged out successfully.",
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
              email: z
                .string()
                .email()
                .openapi({ example: "se.abdelrahman968+test1@gmail.com" }),
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
              token: z.string().openapi({
                example:
                  "b80cefc437a142d2e0a032656a212a25c60dc8a27fb19f9ce4f3645059857d28",
              }),
              newPassword: z
                .string()
                .openapi({ example: "NewPassword@123@rest" }),
              confirmPassword: z
                .string()
                .openapi({ example: "NewPassword@123@rest" }),
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

  // ---------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------
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
    method: "get",
    path: "/user/getUsers",

    tags: ["Users"],

    summary: "Get All Users",

    description: "Get a list of all users.",

    security: [{ bearerAuth: [] }],

    responses: {
      200: {
        description: "Users retrieved successfully.",
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
                .openapi({ example: "se.abdelrahman968+test1@gmail.com" }),
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
              currentPassword: z.string().openapi({ example: "Password@123" }),
              newPassword: z.string().openapi({ example: "NewPassword@123" }),
              confirmPassword: z
                .string()
                .openapi({ example: "NewPassword@123" }),
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

  // ---------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------
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
              firstName: z.string().optional().openapi({ example: "Ahmed" }),
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
}
