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
    version: "1.0.0",
    description: "REST API for Sarahah application.",
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
});
