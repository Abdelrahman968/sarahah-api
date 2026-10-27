import path from "node:path";
import {
  hash as hashPassword,
  verifyHash as verifyPassword,
} from "../../utils/hash/hash.js";
import { isValidObjectId } from "../../utils/validation/isValidObjectId.js";
import userRepository from "../../db/repository/user.repository.js";
import accountRepository from "../../db/repository/account.repository.js";
import deleteAvatarFile from "../../utils/deleteAvatarFile.js";

export const GetMyInfo = async (id) => {
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

export const UpdateProfileService = async (id, body) => {
  isValidObjectId(id);

  const user = await userRepository.findByIdAndUpdate(
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
  isValidObjectId(id);

  await userRepository.ensureEmailAvailableForUpdate(body.email, id);

  const user = await userRepository.findByIdAndUpdate(
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
  isValidObjectId(id);

  const { currentPassword, newPassword, confirmPassword } = body;

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match", {
      cause: { status: 400 },
    });
  }

  const user = await userRepository.findById(id);

  if (!user) {
    throw new Error("User not found", {
      cause: { status: 404 },
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

  const isPasswordValid = await verifyPassword(
    account.password,
    currentPassword,
  );

  if (!isPasswordValid) {
    throw new Error("Current password is incorrect", {
      cause: { status: 400 },
    });
  }

  const isSamePassword = await verifyPassword(account.password, newPassword);

  if (isSamePassword) {
    throw new Error("New password cannot be the same as the current password", {
      cause: { status: 400 },
    });
  }

  const hashedPassword = await hashPassword(newPassword);

  await accountRepository.updatePassword(user._id, hashedPassword);

  return user;
};

export const deleteMeService = async (id) => {
  isValidObjectId(id);

  const user = await userRepository.findByIdAndDelete(id);

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }

  return user;
};

export const updateAvatarService = async (userId, image) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }

  const oldAvatar = user.avatar;

  const updatedUser = await userRepository.findByIdAndUpdate(
    userId,
    { avatar: image.relativePath },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (oldAvatar) {
    try {
      const oldAvatarPath = path.resolve(oldAvatar);
      await deleteAvatarFile(oldAvatarPath);
    } catch (error) {
      console.error("Failed to delete old avatar:", error);
    }
  }

  return updatedUser;
};
