import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      required: true,
      enum: ["password", "google", "github"],
    },

    providerAccountId: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      minLength: [8, "Password must be at least 8 characters"],
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index(
  {
    provider: 1,
    providerAccountId: 1,
  },
  {
    unique: true,
    sparse: true,
  },
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
