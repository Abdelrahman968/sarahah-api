import Conversation from "../models/conversation.model.js";
import BaseRepository from "./base.repository.js";

class ConversationRepository extends BaseRepository {
  constructor() {
    super(Conversation);
  }

  findForParticipant(id, userId) {
    return this.model.findOne({ _id: id, participants: userId });
  }

  findAllForParticipant(userId, { skip, limit }) {
    return this.model
      .find({
        participants: userId,
        userState: { $elemMatch: { userId, hiddenAt: null } },
      })
      .sort({ updatedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  countForParticipant(userId) {
    return this.model.countDocuments({
      participants: userId,
      userState: { $elemMatch: { userId, hiddenAt: null } },
    });
  }

  findForParticipantById(id, userId) {
    return this.model.findOne({ _id: id, participants: userId });
  }

  markRead(id, userId) {
    return this.model.findOneAndUpdate(
      { _id: id, participants: userId, "userState.userId": userId },
      { $set: { "userState.$.readAt": new Date() } },
      { returnDocument: "after" },
    );
  }

  hide(id, userId) {
    return this.model.findOneAndUpdate(
      { _id: id, participants: userId, "userState.userId": userId },
      { $set: { "userState.$.hiddenAt": new Date() } },
      { returnDocument: "after" },
    );
  }
}

export default new ConversationRepository();
