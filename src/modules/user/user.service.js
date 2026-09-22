import { hashPassword, verifyPassword } from "../../utils/password.js";
import { isValidObjectId } from "../../utils/validation/isValidObjectId.js";
import userRepository from "../../db/repository/user.repository.js";

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

  const newEmail = await userRepository.ensureEmailAvailableForUpdate(
    body.email,
    id,
  );

  if (newEmail) {
    throw new Error("Email already taken", {
      cause: {
        status: 400,
      },
    });
  }

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

  const user = await userRepository.findById(id, "+password");

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

  await userRepository.updatePassword(user._id, hashedPassword);

  return user;
};

export const GetAllUsersService = async () => {
  return userRepository.findAll();
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
