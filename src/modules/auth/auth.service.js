import { randomUUID } from "node:crypto";
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiration,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import {
  createAuthenticationSession,
  createSession,
  findActiveSession,
  revokeSession,
} from "../session/session.service.js";
import { welcomeEmailTemplate } from "../../services/email/templates/welcome.template.js";
import { hash, verifyHash } from "../../utils/hash/hash.js";
import { sendEmail } from "../../services/email/email.service.js";
import {
  generatePasswordResetToken,
  hashToken,
} from "../../utils/hash/crypto.js";
import {
  CLIENT_URL,
  OTP_EXPIRES_IN,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
} from "../../../config/env.config.js";
import userRepository from "../../db/repository/user.repository.js";
import sessionRepository from "../../db/repository/session.repository.js";
import passwordResetRepository from "../../db/repository/password-reset.repository.js";
import { resetPasswordEmailTemplate } from "../../services/email/templates/forgot-password.template.js";
import accountRepository from "../../db/repository/account.repository.js";
import { generateUniqueUsername } from "../../utils/userName.js";
import { getGoogleAuthUrl } from "../../services/Oauth/google.service.js";
import {
  redisDel,
  redisExists,
  redisExpire,
  redisGet,
  redisIncr,
  redisSet,
  redisTTL,
} from "../../services/redis/redis.service.js";
import generateCode from "../../utils/generateCode.js";
import { verifyEmailTemplate } from "../../services/email/templates/verify-email.template.js";
import { isValidObjectId } from "../../utils/validation/isValidObjectId.js";
import { OTP_TYPES } from "../../common/constants/otp.constants.js";
import { twoFactorSetupEmailTemplate } from "../../services/email/templates/two-factor-setup.template.js";

export const generateOTPCode = async (userId, otpType) => {
  if (!Object.values(OTP_TYPES).includes(otpType)) {
    throw new Error("Invalid otp type", {
      cause: { status: 400 },
    });
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw new Error("User not found", {
      cause: { status: 404 },
    });
  }

  switch (otpType) {
    case OTP_TYPES.EMAIL_VERIFICATION:
      if (user.isVerified) {
        throw new Error("User is already verified", {
          cause: { status: 400 },
        });
      }
      break;

    case OTP_TYPES.TWO_FACTOR_SETUP:
      if (user.twoFactor.enabled) {
        throw new Error("2FA is already enabled", {
          cause: { status: 409 },
        });
      }
      break;

    case OTP_TYPES.TWO_FACTOR_LOGIN:
      if (!user.twoFactor.enabled) {
        throw new Error("2FA is not enabled", {
          cause: { status: 400 },
        });
      }
      break;

    default:
      throw new Error("Invalid OTP type", {
        cause: { status: 400 },
      });
  }

  const otpCacheKey = `otp:${otpType}:${user.id}`;
  const otpAttemptKey = `${otpCacheKey}:attempts`;

  const otpExists = await redisExists(otpCacheKey);

  if (otpExists) {
    const ttl = await redisTTL(otpCacheKey);

    const minutes = Math.floor(ttl / 60);
    const seconds = ttl % 60;

    return {
      sent: false,
      expiresIn: `${minutes} minutes and ${seconds} seconds`,
    };
  }

  const otpCode = generateCode(OTP_LENGTH);
  const otpHash = await hash(otpCode);

  await redisSet(otpCacheKey, otpHash, OTP_EXPIRES_IN);
  await redisSet(otpAttemptKey, 0, OTP_EXPIRES_IN);

  if (otpType === OTP_TYPES.TWO_FACTOR_SETUP) {
    const html = twoFactorSetupEmailTemplate({
      name: user.firstName,
      otp: otpCode,
      expiresIn: 5,
    });

    sendEmail({
      to: user.email,
      subject: "Confirm Two-Factor Authentication",
      html,
    }).catch((error) => {
      console.error("Otp email failed:", error);
    });
  } else {
    sendEmail({
      to: user.email,
      subject: "OTP Code Verification - Sarahah App",
      html: verifyEmailTemplate({
        name: user.fullName,
        email: user.email,
        code: otpCode,
        verifyUrl: CLIENT_URL,
      }),
    }).catch((error) => {
      console.error("Otp email failed:", error);
    });
  }

  const expiresInMin = Math.floor(OTP_EXPIRES_IN / 60);
  const expiresInSec = OTP_EXPIRES_IN % 60;

  return {
    otpType,
    sent: true,
    expiresIn: `${expiresInMin} minutes and ${expiresInSec} seconds`,
    otp: otpCode, // For testing purposes
  };
};

export const verifyOTPCode = async (userId, otpCode, otpType) => {
  if (!Object.values(OTP_TYPES).includes(otpType)) {
    throw new Error("Invalid otp type", {
      cause: { status: 400 },
    });
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw new Error("User not found", {
      cause: { status: 404 },
    });
  }

  if (!otpCode) {
    throw new Error("OTP code is required", {
      cause: { status: 400 },
    });
  }

  switch (otpType) {
    case OTP_TYPES.EMAIL_VERIFICATION:
      if (user.isVerified) {
        throw new Error("User is already verified", {
          cause: { status: 400 },
        });
      }
      break;

    case OTP_TYPES.TWO_FACTOR_SETUP:
      if (user.twoFactor.enabled) {
        throw new Error("2FA is already enabled", {
          cause: { status: 409 },
        });
      }
      break;

    case OTP_TYPES.TWO_FACTOR_LOGIN:
      if (!user.twoFactor.enabled) {
        throw new Error("2FA is not enabled", {
          cause: { status: 400 },
        });
      }
      break;

    default:
      throw new Error("Invalid OTP type", {
        cause: { status: 400 },
      });
  }

  const otpCacheKey = `otp:${otpType}:${user.id}`;
  const otpAttemptKey = `${otpCacheKey}:attempts`;

  const otpHashCache = await redisGet(otpCacheKey);

  if (!otpHashCache) {
    throw new Error("OTP code not found or expired", {
      cause: { status: 404 },
    });
  }

  const otpAttempt = Number((await redisGet(otpAttemptKey)) ?? 0);

  if (otpAttempt >= OTP_MAX_ATTEMPTS) {
    await redisDel(otpCacheKey);
    await redisDel(otpAttemptKey);

    throw new Error("Too many attempts. OTP code has been revoked", {
      cause: { status: 400 },
    });
  }

  const verifyOTP = await verifyHash(otpHashCache, otpCode);

  if (!verifyOTP) {
    await redisIncr(otpAttemptKey);

    throw new Error("Invalid OTP code", {
      cause: { status: 400 },
    });
  }

  switch (otpType) {
    case OTP_TYPES.EMAIL_VERIFICATION:
      user.isVerified = true;
      await userRepository.save(user);
      break;

    case OTP_TYPES.TWO_FACTOR_SETUP:
      user.twoFactor.enabled = true;
      await userRepository.save(user);
      break;
  }

  await redisDel(otpCacheKey);
  await redisDel(otpAttemptKey);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await createSession({
    userId: user._id,
    refreshToken,
    expiresAt: getTokenExpiration(refreshToken),
  });

  return {
    message: "OTP verified successfully",
    accessToken,
    refreshToken,
  };
};

export const RegisterUserService = async (body) => {
  const { userName, firstName, lastName, email, password, gender, age } = body;

  await userRepository.ensureEmailAvailable(email);
  await userRepository.ensureUserNameAvailable(userName);

  const data = {
    userName,
    firstName,
    lastName,
    email,
    gender,
    age,
  };

  const user = await userRepository.create(data);

  const hashedPassword = await hash(password);

  await accountRepository.create({
    userId: user._id,
    provider: "password",
    providerAccountId: user._id.toString(),
    password: hashedPassword,
  });

  sendEmail({
    to: user.email,
    subject: "Welcome to Sarahah App",
    html: welcomeEmailTemplate({
      name: user.fullName,
      email: user.email,
    }),
  }).catch((error) => {
    console.error("Welcome email failed:", error);
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await createSession({
    userId: user._id,
    refreshToken,
    expiresAt: getTokenExpiration(refreshToken),
  });

  const userInfo = {
    id: user.id,
    role: user.role,
    userName: user.userName,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    gender: user.gender,
    age: user.age,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    user: userInfo,
    accessToken,
    refreshToken,
  };
};

export const LoginUserService = async (body) => {
  const { userName, email, password } = body;

  let user;
  if (userName) {
    user = await userRepository.findByUserName(userName);
  } else {
    user = await userRepository.findByEmail(email);
  }

  if (!user) {
    throw new Error("Email/UserName or password is incorrect", {
      cause: {
        status: 401,
      },
    });
  }

  const account = await accountRepository.findPasswordAccount(user.id);

  if (!account) {
    throw new Error("Email/UserName or password is incorrect", {
      cause: {
        status: 401,
      },
    });
  }

  const loginFailedCacheKey = `login:failed:${user.id}:attempts`;
  const loginBanCacheKey = `login:ban:${user.id}`;

  const isBanned = await redisGet(loginBanCacheKey);

  if (isBanned) {
    throw new Error(
      "Too many failed login attempts. Please try again in 5 minutes.",
      {
        cause: {
          status: 429,
        },
      },
    );
  }

  const isPasswordValid = await verifyHash(account.password, password);

  if (!isPasswordValid) {
    const failedAttempts = await redisIncr(loginFailedCacheKey);

    if (failedAttempts === 1) {
      await redisExpire(loginFailedCacheKey, 300);
    }

    if (failedAttempts >= 5) {
      await redisSet(loginBanCacheKey, "1", 300);

      await redisDel(loginFailedCacheKey);

      throw new Error(
        "Too many failed login attempts. Your account has been temporarily banned for 5 minutes.",
        {
          cause: {
            status: 429,
          },
        },
      );
    }

    throw new Error("Email/UserName or password is incorrect", {
      cause: {
        status: 401,
      },
    });
  }

  await redisDel(loginFailedCacheKey);

  if (user.twoFactor.enabled) {
    const otpResult = await generateOTPCode(
      user.id,
      OTP_TYPES.TWO_FACTOR_LOGIN,
    );

    const challengeKey = `login:2fa:${user.id}`;

    let challenge = await redisGet(challengeKey);

    if (!challenge) {
      challenge = randomUUID();

      await redisSet(challengeKey, challenge, 900);
      await redisSet(`login:2fa:challenge:${challenge}`, user.id, 900);
    }

    return {
      requiresTwoFactor: true,
      challenge,
      otpResult,
    };
  }

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

export const LogoutService = async (refreshToken) => {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);

  await sessionRepository.findOneAndUpdate(
    {
      tokenHash,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

export const revokeAccessToken = async (exp, jti) => {
  const ttl = exp - Math.floor(Date.now() / 1000);

  if (ttl > 0) {
    await redisSet(`revoked:access:${jti}`, "1", ttl);
  }
  return true;
};

export const RefreshTokenService = async (refreshToken) => {
  const payload = verifyRefreshToken(refreshToken);
  const session = await findActiveSession(refreshToken, payload.sub);

  const user = await userRepository.findById(payload.sub);

  if (!user) {
    throw new Error("User not found", {
      cause: { status: 404 },
    });
  }

  await revokeSession(session);

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await createSession({
    userId: user._id,
    refreshToken: newRefreshToken,
    expiresAt: getTokenExpiration(newRefreshToken),
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const ForgotPasswordService = async (email) => {
  const user = await userRepository.findOne({ email });

  if (!user) {
    return {
      massage: "If the email exists, a password reset link has been sent.",
    };
  }

  const token = generatePasswordResetToken();

  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await passwordResetRepository.deleteMany({ userId: user._id, usedAt: null });

  await passwordResetRepository.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}`;

  sendEmail({
    to: user.email,
    subject: "Password Reset",
    html: resetPasswordEmailTemplate({
      name: user.fullName,
      email: user.email,
      resetUrl,
    }),
  }).catch((error) => {
    console.error("Password Reset email failed:", error);
  });

  return {
    message: "If the email exists, a password reset link has been sent.",
    // token,
    // resetUrl,
  };
};

export const ResetPasswordService = async (
  token,
  newPassword,
  confirmPassword,
) => {
  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match", {
      cause: { status: 400 },
    });
  }

  const tokenHash = hashToken(token);

  const resetRequest = await passwordResetRepository.findOne({
    tokenHash,
    usedAt: null,
  });

  if (!resetRequest) {
    throw new Error("Invalid or expired reset token", {
      cause: {
        status: 400,
      },
    });
  }

  if (resetRequest.expiresAt <= new Date()) {
    throw new Error("Invalid or expired reset token", {
      cause: {
        status: 400,
      },
    });
  }

  const user = await userRepository.findById(resetRequest.userId);

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }

  const account = await accountRepository.findPasswordAccount(user.id);

  if (!account) {
    throw new Error("Email / UserName or password is incorrect", {
      cause: {
        status: 401,
      },
    });
  }
  const isSamePassword = await verifyHash(account.password, newPassword);

  if (isSamePassword) {
    throw new Error("New password cannot be the same as the old password", {
      cause: {
        status: 400,
      },
    });
  }

  const newHashedPassword = await hash(newPassword);

  await accountRepository.updatePassword(
    resetRequest.userId,
    newHashedPassword,
  );

  resetRequest.usedAt = new Date();
  await resetRequest.save();

  await sessionRepository.updateMany(
    {
      userId: resetRequest.userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  return user;
};

export const GetProfileService = async (id) => {
  isValidObjectId(id);
  const user = await userRepository.findById(id, "-password");

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }
  return user;
};

// OAuth Google Login

export const getGoogleAuthUrlService = () => {
  return getGoogleAuthUrl();
};

export const googleLogin = async (googleUser) => {
  let account = await accountRepository.findByProviderAccountId(
    "google",
    googleUser.providerAccountId,
  );

  if (account) {
    const user = await userRepository.findById(account.userId);

    if (!user) {
      throw new Error("User not found", {
        cause: {
          status: 404,
        },
      });
    }

    return createAuthenticationSession(user);
  }

  let user = await userRepository.findOne({
    email: googleUser.email,
  });

  if (!user) {
    const userName = await generateUniqueUsername(
      googleUser.firstName,
      googleUser.lastName,
    );

    user = await userRepository.create({
      userName,
      isVerified: true,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      email: googleUser.email,
      avatar: googleUser.avatar,
    });
  }

  account = await accountRepository.create({
    userId: user._id,
    provider: "google",
    providerAccountId: googleUser.providerAccountId,
  });

  return createAuthenticationSession(user);
};

export const githubLogin = async (githubUser) => {
  let account = await accountRepository.findByProviderAccountId(
    "github",
    githubUser.providerAccountId,
  );

  if (account) {
    const user = await userRepository.findById(account.userId);

    if (!user) {
      throw new Error("User not found", {
        cause: {
          status: 404,
        },
      });
    }

    return createAuthenticationSession(user);
  }

  let user = await userRepository.findOne({
    email: githubUser.email,
  });

  if (!user) {
    const userName = await generateUniqueUsername(githubUser.userName, "");

    user = await userRepository.create({
      userName,
      isVerified: true,
      firstName: githubUser.name?.split(" ")[0] || githubUser.userName,
      lastName: githubUser.name?.split(" ").slice(1).join(" ") || "",
      email: githubUser.email,
      avatar: githubUser.profileImage,
    });
  }

  account = await accountRepository.create({
    userId: user._id,
    provider: "github",
    providerAccountId: githubUser.providerAccountId,
  });

  return createAuthenticationSession(user);
};

export const setPasswordService = async (
  userId,
  { password, confirmPassword },
) => {
  const passwordAccount = await accountRepository.findPasswordAccount(userId);

  if (passwordAccount) {
    throw new Error("Password is already set", {
      cause: { status: 409 },
    });
  }

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match", {
      cause: { status: 400 },
    });
  }

  const hashedPassword = await hash(password);

  return accountRepository.create({
    userId,
    provider: "password",
    providerAccountId: userId.toString(),
    password: hashedPassword,
  });
};

export const enable2FA = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new Error("User not found", {
      cause: { status: 404 },
    });
  }

  return generateOTPCode(userId, OTP_TYPES.TWO_FACTOR_SETUP);
};

export const disable2FA = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new Error("User not found", {
      cause: { status: 404 },
    });
  }

  return await userRepository.findByIdAndUpdate(
    userId,
    {
      twoFactor: {
        enable: false,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
};

export const verifyLoginOTPService = async (challenge, otp) => {
  if (!challenge || !otp) {
    throw new Error("Challenge and OTP are required", {
      cause: { status: 400 },
    });
  }

  const redisKey = `login:2fa:challenge:${challenge}`;
  const userId = await redisGet(redisKey);

  if (!userId) {
    throw new Error("Login challenge is invalid or expired", {
      cause: { status: 401 },
    });
  }

  const result = await verifyOTPCode(userId, otp, OTP_TYPES.TWO_FACTOR_LOGIN);

  const user = await userRepository.findById(userId);

  await redisDel(redisKey);
  await redisDel(`login:2fa:${userId}`);

  return {
    user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  };
};

export const resendOTPService = async (userId, otpType) => {
  return generateOTPCode(userId, otpType);
};
