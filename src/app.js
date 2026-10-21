import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";

import { API_PREFIX, TRUSTED_ORIGINS } from "../config/env.config.js";

import { resFormatter } from "./middleware/resFormatter.middleware.js";
import { notFoundRoute } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimit.middleware.js";
import { requireVerifiedEmail } from "./middleware/requireVerifiedEmail.middleware.js";

import {
  AdminRoutes,
  AuthRoutes,
  SystemRoutes,
  UserRoutes,
} from "./modules/index.js";
import { authenticate } from "./middleware/authenticate.middleware.js";
import { authorize } from "./middleware/authorize.middleware.js";

import { apiReference } from "@scalar/express-api-reference";
import { openapiDocument } from "./docs/openapi.js";

const app = express();
const postmanCollectionPath = fileURLToPath(
  new URL("./docs/Sarahah App.postman_collection.json", import.meta.url),
);

app.use(cookieParser());
app.disable("x-powered-by");

app.use(
  cors({
    origin: TRUSTED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  }),
);

app.use(express.json());
app.use(resFormatter);

app.get("/", (_req, res) => {
  res.redirect(API_PREFIX);
});

app.get(`${API_PREFIX}`, (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Sarahah API",
    data: {
      apiPrefix: API_PREFIX,
      version: "1.0.0",
      Repo: "https://github.com/Abdelrahman968/sarahah-api",
      Author: "Abdelrahman Ayman",
      info: "Route Academy Assignment",
    },
    docs: {
      apiRoutes: `${API_PREFIX}/docs`,
      postmanCollection: `${API_PREFIX}/docs/postman`,
    },
  });
});

const routes = [
  {
    path: "/system",
    middlewares: [apiLimiter],
    router: SystemRoutes,
    docs: {
      tag: "System",
    },
  },
  {
    path: "/auth",
    middlewares: [authLimiter],
    router: AuthRoutes,
    docs: {
      tag: "Auth",
    },
  },
  {
    path: "/user",
    middlewares: [authenticate, requireVerifiedEmail, apiLimiter],
    router: UserRoutes,
    docs: {
      tag: "Users",
    },
  },
  {
    path: "/admin",
    middlewares: [authenticate, requireVerifiedEmail, authorize("admin")],
    router: AdminRoutes,
    docs: {
      tag: "Admin",
    },
  },
];

routes.forEach(({ path, middlewares, router }) => {
  app.use(`${API_PREFIX}${path}`, ...middlewares, router);
});

app.get(`${API_PREFIX}/docs/postman`, (_req, res) => {
  res.download(postmanCollectionPath, "Sarahah App.postman_collection.json");
});

app.use(
  `${API_PREFIX}/docs`,
  apiReference({
    spec: {
      content: openapiDocument,
    },
    theme: "kepler",
    layout: "modern",
    darkMode: true,
    pageTitle: "Sarahah API Documentation",
    showDeveloperTools: "localhost",
    customCss: `
      :root {
        --scalar-color-accent: #14b8a6;
        --scalar-radius: 12px;
      }
    `,
  }),
);

app.use(notFoundRoute);
app.use(errorHandler);

export default app;
