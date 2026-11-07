import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    anonymousMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      unique: true,
    },
    identityRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IdentityRequest",
      required: true,
      unique: true,
    },
    userState: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        readAt: { type: Date, default: null },
        hiddenAt: { type: Date, default: null },
      },
    ],
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1, updatedAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
