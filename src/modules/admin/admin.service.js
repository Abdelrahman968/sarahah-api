import userRepository from "../../db/repository/user.repository.js";
import { isValidObjectId } from "../../utils/validation/isValidObjectId.js";

export const DeleteUserById = async (id) => {
  isValidObjectId(id);

  return userRepository.findByIdAndDelete(id);
};

export const updateUserById = async (id, data) => {
  isValidObjectId(id);

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    Object.keys(data).length === 0
  ) {
    throw new Error("Data is required", {
      cause: {
        status: 400,
      },
    });
  }

  const user = await userRepository.findById(id);

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }

  const updateData = { ...data };

  if (updateData.email) {
    updateData.email = updateData.email.toLowerCase().trim();
    await userRepository.ensureEmailAvailableForUpdate(
      updateData.email,
      user._id,
    );
  }

  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  return userRepository.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
};
