import User from "../db/models/user.model.js";

export const isEmailExist = async (email) => {
  const exists = await User.exists({ email: { $regex: email, $options: "i" } });

  if (exists) {
    throw new Error("Email already exists", {
      cause: {
        status: 409,
      },
    });
  }
};

export const isEmailTakenByAnotherUser = async (email, userId) => {
  const exists = await User.exists({
    email: email.toLowerCase(),
    _id: { $ne: userId },
  });

  if (exists) {
    throw new Error("Email already exists", {
      cause: {
        status: 409,
      },
    });
  }
};
