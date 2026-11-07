import Message from "../models/message.model.js";
import BaseRepository from "./base.repository.js";

class MessageRepository extends BaseRepository {
  constructor() {
    super(Message);
  }

  findReceived(receiverId, { skip, limit }) {
    return this.model
      .find({ receiverId })
      .select("content createdAt updatedAt")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  countReceived(receiverId) {
    return this.model.countDocuments({ receiverId });
  }

  findSent(senderId, { skip, limit }) {
    return this.model.find({ senderId }).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean();
  }

  countSent(senderId) {
    return this.model.countDocuments({ senderId });
  }

  deleteForSender(id, senderId) {
    return this.model.findOneAndDelete({ _id: id, senderId });
  }
}

export default new MessageRepository();
