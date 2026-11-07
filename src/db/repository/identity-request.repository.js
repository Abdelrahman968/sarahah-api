import mongoose from "mongoose";
import IdentityRequest from "../models/identity-request.model.js";
import BaseRepository from "./base.repository.js";

class IdentityRequestRepository extends BaseRepository {
  constructor() {
    super(IdentityRequest);
  }

  findForSender(senderId, { skip, limit }) {
    senderId = new mongoose.Types.ObjectId(senderId);

    return this.model.aggregate([
      {
        $lookup: {
          from: "messages",
          localField: "messageId",
          foreignField: "_id",
          as: "message",
        },
      },
      { $unwind: "$message" },
      { $match: { "message.senderId": senderId } },
      { $sort: { createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "_id",
          as: "receiver",
        },
      },
      { $unwind: "$receiver" },
      {
        $project: {
          _id: 1,
          messageId: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          receiver: {
            _id: "$receiver._id",
            userName: "$receiver.userName",
            firstName: "$receiver.firstName",
            lastName: "$receiver.lastName",
            avatar: "$receiver.avatar",
          },
        },
      },
    ]);
  }

  countForSender(senderId) {
    return this.model
      .aggregate([
        {
          $lookup: {
            from: "messages",
            localField: "messageId",
            foreignField: "_id",
            as: "message",
          },
        },
        { $unwind: "$message" },
        { $match: { "message.senderId": senderId } },
        { $count: "total" },
      ])
      .then(([result]) => result?.total ?? 0);
  }

  findPendingByMessage(messageId) {
    return this.model.findOne({ messageId, status: "pending" });
  }

  findAcceptedByMessage(messageId) {
    return this.model.findOne({ messageId, status: "accepted" });
  }

  acceptPending(id, session) {
    return this.model.findOneAndUpdate(
      { _id: id, status: "pending" },
      { $set: { status: "accepted" } },
      { returnDocument: "after", runValidators: true, session },
    );
  }
}

export default new IdentityRequestRepository();
