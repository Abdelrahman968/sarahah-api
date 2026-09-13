import jwt from "jsonwebtoken";

import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
} from "../../config/env.config.js";

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: "access",
    },
    JWT_ACCESS_SECRET,
    {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      issuer: "sarahah-api",
      audience: "sarahah-client",
    },
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      type: "refresh",
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: "sarahah-api",
      audience: "sarahah-client",
    },
  );
};

export const verifyRefreshToken = (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET, {
      issuer: "sarahah-api",
      audience: "sarahah-client",
    });

    if (
      typeof payload !== "object" ||
      payload.type !== "refresh" ||
      !payload.sub
    ) {
      throw new Error();
    }

    return payload;
  } catch {
    throw new Error("Invalid refresh token", {
      cause: { status: 401 },
    });
  }
};

export const getTokenExpiration = (token) => {
  const payload = jwt.decode(token);

  if (!payload || typeof payload !== "object" || !payload.exp) {
    throw new Error("Invalid token", {
      cause: { status: 401 },
    });
  }

  return new Date(payload.exp * 1000);
};
