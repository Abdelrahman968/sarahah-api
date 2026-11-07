import ConversationMessage from "../models/conversation-message.model.js";
import BaseRepository from "./base.repository.js";

class ConversationMessageRepository extends BaseRepository {
  constructor() {
    super(ConversationMessage);
  }

  findByConversation(conversationId, { skip, limit }) {
    return this.model
      .find({ conversationId })
      .select("senderId content createdAt updatedAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  countByConversation(conversationId) {
    return this.model.countDocuments({ conversationId });
  }
}

export default new ConversationMessageRepository();
