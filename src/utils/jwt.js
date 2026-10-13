import jwt from "jsonwebtoken";

import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_ADMIN_ACCESS_EXPIRES_IN,
  JWT_ADMIN_ACCESS_SECRET,
  JWT_ADMIN_REFRESH_EXPIRES_IN,
  JWT_ADMIN_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
} from "../../config/env.config.js";

export const generateAccessToken = (user) => {
  const role = user.role;

  if (!role) {
    throw new Error("User role is required to generate access token");
  }

  const isUser = role === "user";

  return jwt.sign(
    {
      sub: user._id.toString(),
      role,
      type: "access",
    },
    isUser ? JWT_ACCESS_SECRET : JWT_ADMIN_ACCESS_SECRET,
    {
      expiresIn: isUser ? JWT_ACCESS_EXPIRES_IN : JWT_ADMIN_ACCESS_EXPIRES_IN,
      issuer: "sarahah-api",
      audience: "sarahah-client",
    },
  );
};

export const generateRefreshToken = (user) => {
  const role = user.role;

  if (!role) {
    throw new Error("User role is required to generate access token");
  }

  const isUser = role === "user";

  return jwt.sign(
    {
      sub: user._id.toString(),
      role,
      type: "refresh",
    },
    isUser ? JWT_REFRESH_SECRET : JWT_ADMIN_REFRESH_SECRET,
    {
      expiresIn: isUser ? JWT_REFRESH_EXPIRES_IN : JWT_ADMIN_REFRESH_EXPIRES_IN,
      issuer: "sarahah-api",
      audience: "sarahah-client",
    },
  );
};

export const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.decode(refreshToken);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.role ||
      decoded.type !== "refresh"
    ) {
      throw new Error();
    }

    const secret =
      decoded.role === "user" ? JWT_REFRESH_SECRET : JWT_ADMIN_REFRESH_SECRET;

    const payload = jwt.verify(refreshToken, secret, {
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
