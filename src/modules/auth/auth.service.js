import {
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiration,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import {
  createSession,
  findActiveSession,
  revokeSession,
} from "../session/session.service.js";
import { welcomeEmailTemplate } from "../../services/email/templates/welcome.template.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import { sendEmail } from "../../services/email/email.service.js";
import {
  generatePasswordResetToken,
  hashToken,
} from "../../utils/cryptoHash.js";
import { CLIENT_URL } from "../../../config/env.config.js";
import userRepository from "../../db/repository/user.repository.js";
import sessionRepository from "../../db/repository/session.repository.js";
import passwordResetRepository from "../../db/repository/password-reset.repository.js";
import { resetPasswordEmailTemplate } from "../../services/email/templates/forgot-password.template.js";

export const RegisterUserService = async (body) => {
  const { firstName, lastName, email, password, gender, age } = body;

  await userRepository.ensureEmailAvailable(email);

  const hashedPassword = await hashPassword(password);

  const data = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    gender,
    age,
  };

  const user = await userRepository.create(data);

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

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      gender: user.gender,
      age: user.age,
      profileImage: user.profileImage,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    accessToken,
    refreshToken,
  };
};

export const LoginUserService = async (body) => {
  const { email, password } = body;

  const user = await userRepository.findByEmail(email, "+password");

  if (!user) {
    throw new Error("Email or password is incorrect", {
      cause: {
        status: 401,
      },
    });
  }

  const isPasswordValid = await verifyPassword(user.password, password);

  if (!isPasswordValid) {
    throw new Error("Email or password is incorrect", {
      cause: {
        status: 401,
      },
    });
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

  const user = await userRepository.findById(resetRequest.userId, "+password");

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }

  const isSamePassword = await verifyPassword(user.password, newPassword);

  if (isSamePassword) {
    throw new Error("New password cannot be the same as the old password", {
      cause: {
        status: 400,
      },
    });
  }

  const newHashedPassword = await hashPassword(newPassword);

  await userRepository.updatePassword(resetRequest.userId, newHashedPassword);

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
