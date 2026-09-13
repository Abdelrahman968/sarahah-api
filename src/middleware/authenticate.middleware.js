import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../../config/env.config.js";

export const authenticate = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new Error("Authentication required", {
        cause: {
          status: 401,
        },
      });
    }

    const [scheme, accessToken] = authorization.split(" ");

    if (scheme !== "Bearer" || !accessToken) {
      throw new Error("Invalid authorization header", {
        cause: {
          status: 401,
        },
      });
    }

    const payload = jwt.verify(accessToken, JWT_ACCESS_SECRET, {
      issuer: "sarahah-api",
      audience: "sarahah-client",
    });

    if (
      typeof payload !== "object" ||
      payload.type !== "access" ||
      !payload.sub
    ) {
      return res.status(401).json({
        message: "Invalid access token",
      });
    }

    req.user = {
      id: payload.sub,
    };

    next();
  } catch (error) {
    next(error);
  }
};
