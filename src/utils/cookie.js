import {
  API_PREFIX,
  JWT_REFRESH_COOKIE_NAME,
  NODE_ENV,
} from "../../config/env.config.js";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "lax",
  path: `${API_PREFIX}/auth`,
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie(JWT_REFRESH_COOKIE_NAME, token, refreshTokenCookieOptions);
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(JWT_REFRESH_COOKIE_NAME, refreshTokenCookieOptions);
};
