import Block from "../models/block.model.js";
import BaseRepository from "./base.repository.js";

class BlockRepository extends BaseRepository {
  constructor() {
    super(Block);
  }

  findBlock(blockerId, blockedUserId) {
    return this.model.findOne({ blockerId, blockedUserId });
  }

  findBlockedUsers(blockerId) {
    return this.model
      .find({ blockerId })
      .populate("blockedUserId", "userName firstName lastName avatar")
      .sort({ createdAt: -1 })
      .lean();
  }

  removeBlock(blockerId, blockedUserId) {
    return this.model.findOneAndDelete({ blockerId, blockedUserId });
  }

  existsBetween(userA, userB) {
    return this.model.exists({
      $or: [
        { blockerId: userA, blockedUserId: userB },
        { blockerId: userB, blockedUserId: userA },
      ],
    });
  }
}

export default new BlockRepository();
