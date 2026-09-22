import mongoose from "mongoose";

export const isValidObjectId = (ids) => {
  const values = Array.isArray(ids) ? ids : [ids];

  const isValid = values.every((id) => mongoose.isValidObjectId(id));

  if (!isValid) {
    throw new Error("Invalid user ID", {
      cause: {
        status: 400,
      },
    });
  }

  return true;
};
