import { isEmailExist } from "../../utils/checkEmail.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiration,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import Session from "../../db/models/session.model.js";
import {
  createSession,
  findActiveSession,
  revokeSession,
} from "../session/session.service.js";
import { welcomeEmailTemplate } from "../../services/email/templates/welcome.template.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import User from "../../db/models/user.model.js";
import { sendEmail } from "../../services/email/email.service.js";
import {
  generatePasswordResetToken,
  hashToken,
} from "../../utils/cryptoHash.js";
import PasswordReset from "../../db/models/password-reset.model.js";
import { CLIENT_URL } from "../../../config/env.config.js";

export const RegisterUserService = async (body) => {
  const { firstName, lastName, email, password, gender, age } = body;

  await isEmailExist(email);

  const hashedPassword = await hashPassword(password);

  const data = {
    firstName,
    lastName,
    email,
    password: hashedPassword,
    gender,
    age,
  };

  let user;

  try {
    user = await User.create(data);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      throw new Error("Email already exists", {
        cause: {
          status: 409,
        },
      });
    }

    throw error;
  }

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

  const user = await User.findOne({ email }).select("+password");

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

  await Session.findOneAndUpdate(
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

  const user = await User.findById(payload.sub);

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
  const user = await User.findOne({ email });

  if (!user) {
    return {
      massage: "If the email exists, a password reset link has been sent.",
    };
  }

  const token = generatePasswordResetToken();

  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await PasswordReset.deleteMany({ userId: user._id, usedAt: null });

  await PasswordReset.create({
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
    token,
    resetUrl,
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

  const resetRequest = await PasswordReset.findOne({
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

  const user = await User.findById(resetRequest.userId).select("+password");

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

  user.password = newHashedPassword;
  await user.save();

  resetRequest.usedAt = new Date();
  await resetRequest.save();

  await Session.updateMany(
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
  const user = await User.findById(id).select("-password");

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }
  return user;
};
