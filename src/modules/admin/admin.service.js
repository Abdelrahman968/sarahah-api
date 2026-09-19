import User from "../../db/models/user.model.js";
import { isEmailTakenByAnotherUser } from "../../utils/checkEmail.js";
import { isValidObjectId } from "../../utils/isValidObjectId.js";

export const DeleteUserById = async (id) => {
  isValidObjectId(id);

  return User.findByIdAndDelete(id);
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

  const user = await User.findById(id);

  if (!user) {
    throw new Error("User not found", {
      cause: {
        status: 404,
      },
    });
  }

  const updateData = { ...data };

  if (updateData.email) {
    await isEmailTakenByAnotherUser(updateData.email, user._id);

    updateData.email = updateData.email;
  }

  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  return User.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
};
