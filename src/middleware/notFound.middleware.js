import { API_PREFIX } from "../../config/env.config.js";

export const notFoundRoute = (req, res) => {
  return res.status(404).json({
    status: false,
    message: "Route not found",
    API_PREFIX,
    route: req.originalUrl,
    method: req.method,
    data: null,
  });
};
