import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_SECRET,
  JWT_ADMIN_ACCESS_SECRET,
} from "../../config/env.config.js";
import { redisExists } from "../services/redis/redis.service.js";

export const authenticate = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new Error("Authentication required", {
        cause: {
          status: 401,
        },
      });
    }

    const [scheme, accessToken, ...rest] = authorization.split(" ");

    if (scheme !== "Bearer" || !accessToken || rest.length > 0) {
      throw new Error("Invalid authorization header", {
        cause: {
          status: 401,
        },
      });
    }

    const decoded = jwt.decode(accessToken);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      decoded.type !== "access" ||
      !decoded.role
    ) {
      throw new Error("Invalid Access token", {
        cause: { status: 401 },
      });
    }

    const secret =
      decoded.role === "user" ? JWT_ACCESS_SECRET : JWT_ADMIN_ACCESS_SECRET;

    const payload = jwt.verify(accessToken, secret, {
      issuer: "sarahah-api",
      audience: "sarahah-client",
    });

    if (
      typeof payload !== "object" ||
      payload.type !== "access" ||
      !payload.sub ||
      !payload.jti ||
      typeof payload.isVerified !== "boolean" ||
      !payload.exp
    ) {
      throw new Error("Invalid access token", {
        cause: {
          status: 401,
        },
      });
    }

    const isRevoked = await redisExists(`revoked:access:${payload.jti}`);

    if (isRevoked) {
      throw new Error("Access token has been revoked", {
        cause: { status: 401 },
      });
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
      isVerified: payload.isVerified,
      jti: payload.jti,
      exp: payload.exp,
    };

    next();
  } catch (error) {
    next(error);
  }
};
