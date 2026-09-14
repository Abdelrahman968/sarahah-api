import mongoose from "mongoose";
import User from "../../db/models/user.model.js";
import { isEmailTakenByAnotherUser } from "../../utils/checkEmail.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";

import {
  generatePasswordResetToken,
  hashToken,
} from "../../utils/cryptoHash.js";

import { sendEmail } from "../../services/email/email.service.js";
import PasswordReset from "../../db/models/password-reset.model.js";
import { CLIENT_URL } from "../../../config/env.config.js";
import { resetPasswordEmailTemplate } from "../../services/email/templates/forgot-password.template.js";
import Session from "../../db/models/session.model.js";

export const GetProfileService = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID", {
      cause: {
        status: 400,
      },
    });
  }
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }
  return user;
};

export const UpdateProfileService = async (id, body) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid user ID", {
      cause: {
        status: 400,
      },
    });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: body },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }

  return user;
};

export const UpdateEmailService = async (id, body) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid user ID", {
      cause: {
        status: 400,
      },
    });
  }

  const newEmail = await isEmailTakenByAnotherUser(body.email, id);

  if (newEmail) {
    throw new Error("Email already taken", {
      cause: {
        status: 400,
      },
    });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: body },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }

  return user;
};

export const updatePasswordService = async (id, body) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error("Invalid user ID", {
      cause: { status: 400 },
    });
  }

  const { currentPassword, newPassword, confirmPassword } = body;

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match", {
      cause: { status: 400 },
    });
  }

  const user = await User.findById(id).select("+password");

  if (!user) {
    throw new Error("User not found", {
      cause: { status: 404 },
    });
  }

  const isPasswordValid = await verifyPassword(user.password, currentPassword);

  if (!isPasswordValid) {
    throw new Error("Current password is incorrect", {
      cause: { status: 400 },
    });
  }

  const isSamePassword = await verifyPassword(user.password, newPassword);

  if (isSamePassword) {
    throw new Error("New password cannot be the same as the current password", {
      cause: { status: 400 },
    });
  }

  const hashedPassword = await hashPassword(newPassword);

  user.password = hashedPassword;

  await user.save();

  return user;
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
