import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";

import { registerDocsRoutes } from "./routes.js";
import { API_PREFIX } from "../../config/env.config.js";

const registry = new OpenAPIRegistry();

registerDocsRoutes(registry);

const generator = new OpenApiGeneratorV31(registry.definitions);

export const openapiDocument = generator.generateDocument({
  openapi: "3.1.0",

  info: {
    title: "Sarahah API",
    version: "0.1.0",
    description:
      "A secure and scalable RESTful API for an anonymous messaging platform, built with Node.js, Express.js, MongoDB, and Mongoose. Includes authentication, user management, anonymous messages, sessions, password recovery, and email notifications.",
  },

  servers: [
    {
      url: `http://localhost:5000${API_PREFIX}`,
      description: "Development server",
    },
  ],

  tags: [
    {
      name: "System",
      description: "System and health endpoints",
    },
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
    {
      name: "Users",
      description: "User endpoints",
    },
    {
      name: "Admin",
      description: "Admin endpoints",
    },
  ],

  externalDocs: {
    url: "https://documenter.getpostman.com/view/34579966/2sBYAyu9Ts",
    description: "PostMan Documentation",
  },
});
