import { API_PREFIX, NODE_ENV } from "../../config/env.config.js";

export const errorHandler = (error, req, res, _) => {
  const statusCode = error?.cause?.status || 500;
  const service = error?.cause?.service;
  const stackFile = error.stack?.split("\n")[1]?.trim() || "";

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
    data: {
      statusCode: statusCode,
      service,
      ...(NODE_ENV === "development" && { stack: stackFile }),
      route: req.originalUrl,
      method: req.method,
      API_PREFIX,
    },
  });
};
