import mongoose from "mongoose";

const identityRequestSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  { timestamps: true },
);

identityRequestSchema.index(
  { messageId: 1 },
  {
    name: "idx_active_identity_request_message_unique",
    unique: true,
    partialFilterExpression: { isActive: true },
  },
);
identityRequestSchema.index({ receiverId: 1, createdAt: -1 });

const IdentityRequest = mongoose.model("IdentityRequest", identityRequestSchema);

export default IdentityRequest;
