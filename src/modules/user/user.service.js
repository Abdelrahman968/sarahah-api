import User from "../../db/models/user.model.js";
import { isEmailTakenByAnotherUser } from "../../utils/checkEmail.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";

import { isValidObjectId } from "../../utils/isValidObjectId.js";

export const GetMyInfo = async (id) => {
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

export const UpdateProfileService = async (id, body) => {
  isValidObjectId(id);

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
  isValidObjectId(id);

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
  isValidObjectId(id);

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

export const GetAllUsersService = async () => {
  return User.find();
};

export const deleteMeService = async (id) => {
  isValidObjectId(id);

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }

  return user;
};
