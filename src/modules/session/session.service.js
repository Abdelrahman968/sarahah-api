import sessionRepository from "../../db/repository/session.repository.js";
import { hashToken } from "../../utils/hash/crypto.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiration,
} from "../../utils/jwt.js";

export const findActiveSession = async (refreshToken, userId) => {
  const tokenHash = hashToken(refreshToken);

  const session = await sessionRepository.findOne({
    tokenHash,
    userId,
    revokedAt: null,
  });

  if (!session) {
    throw new Error("Refresh token has been revoked", {
      cause: { status: 401 },
    });
  }

  if (session.expiresAt <= new Date()) {
    throw new Error("Refresh token has expired", {
      cause: { status: 401 },
    });
  }

  return session;
};

export const revokeSession = async (session) => {
  session.revokedAt = new Date();

  await sessionRepository.save(session);

  return session;
};

export const createSession = async ({ userId, refreshToken, expiresAt }) => {
  const tokenHash = hashToken(refreshToken);

  return sessionRepository.create({
    userId,
    tokenHash,
    expiresAt,
  });
};

export const createAuthenticationSession = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await createSession({
    userId: user._id,
    refreshToken,
    expiresAt: getTokenExpiration(refreshToken),
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
