import { API_PREFIX, NODE_ENV } from "../../config/env.config.js";

const REFRESH_TOKEN_COOKIE = "refreshToken";

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "lax",
  path: `${API_PREFIX}/users`,
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie(REFRESH_TOKEN_COOKIE, token, refreshTokenCookieOptions);
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions);
};
