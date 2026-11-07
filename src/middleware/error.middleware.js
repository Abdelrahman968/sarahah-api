import { API_PREFIX, NODE_ENV } from "../../config/env.config.js";

export const errorHandler = (error, req, res, _) => {
  const uploadStatus =
    error?.name === "MulterError"
      ? error.code === "LIMIT_FILE_SIZE"
        ? 413
        : 400
      : undefined;
  const statusCode = error?.cause?.status || uploadStatus || 500;
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
