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
      `Sarahah App REST API built with Node.js, Express, and MongoDB. Includes authentication, user management, OAuth, email verification, and password recovery.\n\n[Download the Postman collection](${API_PREFIX}/docs/postman) or [view the hosted Postman documentation](https://documenter.getpostman.com/view/34579966/2sBYAyu9Ts).`,
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
      name: "Admin",
      description: "Admin endpoints",
    },
    {
      name: "Users",
      description: "User endpoints",
    },
  ],

  externalDocs: {
    url: "https://documenter.getpostman.com/view/34579966/2sBYAyu9Ts",
    description: "Postman Documentation",
  },
});
