import userRepository from "../../db/repository/user.repository.js";
import blockRepository from "../../db/repository/block.repository.js";
import { isValidObjectId } from "../../utils/validation/isValidObjectId.js";

export const blockUserService = async (blockerId, blockedUserId) => {
  isValidObjectId([blockerId, blockedUserId]);
  if (blockerId === blockedUserId) {
    throw new Error("You cannot block yourself", { cause: { status: 400 } });
  }
  if (!(await userRepository.findById(blockedUserId, "_id"))) {
    throw new Error("User not found", { cause: { status: 404 } });
  }
  if (await blockRepository.findBlock(blockerId, blockedUserId)) {
    throw new Error("User is already blocked", { cause: { status: 409 } });
  }
  try {
    const block = await blockRepository.create({ blockerId, blockedUserId });
    return { id: block.id, blockedUserId: block.blockedUserId.toString(), createdAt: block.createdAt };
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("User is already blocked", { cause: { status: 409 } });
    }
    throw error;
  }
};

export const unblockUserService = async (blockerId, blockedUserId) => {
  isValidObjectId([blockerId, blockedUserId]);
  const block = await blockRepository.removeBlock(blockerId, blockedUserId);
  if (!block) throw new Error("Blocked user not found", { cause: { status: 404 } });
  return { blockedUserId: block.blockedUserId.toString() };
};

export const getBlockedUsersService = async (blockerId) => {
  isValidObjectId(blockerId);
  const blocks = await blockRepository.findBlockedUsers(blockerId);
  return blocks.flatMap(({ _id, blockedUserId, createdAt }) =>
    blockedUserId
      ? [{ id: _id.toString(), user: { id: blockedUserId._id.toString(), userName: blockedUserId.userName, firstName: blockedUserId.firstName, lastName: blockedUserId.lastName, avatar: blockedUserId.avatar }, createdAt }]
      : [],
  );
};
