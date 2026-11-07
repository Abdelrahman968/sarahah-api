import mongoose from "mongoose";

const conversationMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "Message cannot be empty"],
      maxLength: [2000, "Message must be at most 2000 characters"],
    },
  },
  { timestamps: true },
);

conversationMessageSchema.index({ conversationId: 1, createdAt: -1 });

const ConversationMessage = mongoose.model(
  "ConversationMessage",
  conversationMessageSchema,
);

export default ConversationMessage;
