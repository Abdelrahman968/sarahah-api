import mongoose from "mongoose";
import User from "../../db/models/user.model.js";
import {
  isEmailExist,
  isEmailTakenByAnotherUser,
} from "../../utils/checkEmail.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  getTokenExpiration,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { hashToken } from "../../utils/tokenHash.js";
import Session from "../../db/models/session.model.js";
import {
  createSession,
  findActiveSession,
  revokeSession,
} from "../session/session.service.js";

export const CreateUserService = async (body) => {
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

  const user = await User.create(data);

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
