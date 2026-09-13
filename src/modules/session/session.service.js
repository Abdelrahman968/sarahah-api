import Session from "../../db/models/session.model.js";
import { hashToken } from "../../utils/tokenHash.js";

export const findActiveSession = async (refreshToken, userId) => {
  const tokenHash = hashToken(refreshToken);

  const session = await Session.findOne({
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

  await session.save();

  return session;
};

export const createSession = async ({ userId, refreshToken, expiresAt }) => {
  const tokenHash = hashToken(refreshToken);

  return Session.create({
    userId,
    tokenHash,
    expiresAt,
  });
};
