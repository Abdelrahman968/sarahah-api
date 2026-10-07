import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      required: true,
      enum: ["github"],
    },

    providerAccountId: {
      type: String,
      required: true,
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
  },
);

const Account = mongoose.model("Account", accountSchema);

export default Account;
