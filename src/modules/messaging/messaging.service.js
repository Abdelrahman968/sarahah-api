import mongoose from "mongoose";
import ConversationMessage from "../../db/models/conversation-message.model.js";
import Conversation from "../../db/models/conversation.model.js";
import Message from "../../db/models/message.model.js";
import IdentityRequest from "../../db/models/identity-request.model.js";
import userRepository from "../../db/repository/user.repository.js";
import messageRepository from "../../db/repository/message.repository.js";
import identityRequestRepository from "../../db/repository/identity-request.repository.js";
import conversationRepository from "../../db/repository/conversation.repository.js";
import conversationMessageRepository from "../../db/repository/conversation-message.repository.js";
import { isValidObjectId } from "../../utils/validation/isValidObjectId.js";
import blockRepository from "../../db/repository/block.repository.js";

const publicUserFields = "userName firstName lastName avatar";

const conflictError = (message) =>
  new Error(message, { cause: { status: 409 } });

const pageOptions = ({ page, limit }) => ({
  page,
  limit,
  skip: (page - 1) * limit,
});

const paginatedResult = (data, page, limit, totalItems) => ({
  data,
  pagination: {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
  },
});

export const sendAnonymousMessageService = async (senderId, body) => {
  isValidObjectId([senderId, body.receiverId]);
  const receiverId = body.receiverId.toLowerCase();

  if (senderId === receiverId) {
    throw new Error("You cannot send an anonymous message to yourself", {
      cause: { status: 400 },
    });
  }

  const receiver = await userRepository.findById(receiverId, "_id");
  if (!receiver) {
    throw new Error("Receiver not found", { cause: { status: 404 } });
  }
  if (await blockRepository.existsBetween(senderId, receiverId)) {
    throw new Error("Messaging is not allowed between these users", { cause: { status: 403 } });
  }

  const message = await Message.create({
    senderId,
    receiverId,
    content: body.content,
  });

  return {
    id: message.id,
    receiverId: message.receiverId.toString(),
    content: message.content,
    createdAt: message.createdAt,
  };
};

export const getReceivedMessagesService = async (receiverId, query) => {
  isValidObjectId(receiverId);
  const { page, limit, skip } = pageOptions(query);
  const [messages, totalItems] = await Promise.all([
    messageRepository.findReceived(receiverId, { skip, limit }),
    messageRepository.countReceived(receiverId),
  ]);

  return paginatedResult(
    messages.map(({ _id, content, createdAt, updatedAt }) => ({
      id: _id.toString(),
      content,
      createdAt,
      updatedAt,
    })),
    page,
    limit,
    totalItems,
  );
};

export const requestMessageIdentityService = async (receiverId, messageId) => {
  isValidObjectId([receiverId, messageId]);
  const message = await Message.findById(messageId).select("receiverId").lean();

  if (!message) {
    throw new Error("Message not found", { cause: { status: 404 } });
  }

  if (message.receiverId.toString() !== receiverId) {
    throw new Error("You are not authorized to request this message identity", {
      cause: { status: 403 },
    });
  }

  if (await identityRequestRepository.findAcceptedByMessage(messageId)) {
    throw conflictError("Identity has already been revealed for this message");
  }

  if (await identityRequestRepository.findPendingByMessage(messageId)) {
    throw conflictError("An identity request is already pending");
  }

  try {
    const request = await IdentityRequest.create({
      messageId,
      receiverId,
      status: "pending",
    });

    return {
      id: request.id,
      messageId: request.messageId.toString(),
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  } catch (error) {
    if (error.code === 11000) {
      throw conflictError("An identity request is already pending or accepted");
    }
    throw error;
  }
};

export const getIdentityRequestsService = async (senderId, query) => {
  isValidObjectId(senderId);
  const { page, limit, skip } = pageOptions(query);
  const [requests, totalItems] = await Promise.all([
    identityRequestRepository.findForSender(senderId, { skip, limit }),
    identityRequestRepository.countForSender(new mongoose.Types.ObjectId(senderId)),
  ]);

  return paginatedResult(
    requests.map((request) => ({
      id: request._id.toString(),
      messageId: request.messageId.toString(),
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      receiver: {
        id: request.receiver._id.toString(),
        userName: request.receiver.userName,
        firstName: request.receiver.firstName,
        lastName: request.receiver.lastName,
        avatar: request.receiver.avatar,
      },
    })),
    page,
    limit,
    totalItems,
  );
};

export const updateIdentityRequestService = async (senderId, requestId, status) => {
  isValidObjectId([senderId, requestId]);
  const request = await IdentityRequest.findById(requestId).lean();

  if (!request) {
    throw new Error("Identity request not found", { cause: { status: 404 } });
  }

  const message = await Message.findOne({ _id: request.messageId, senderId })
    .select("receiverId")
    .lean();
  if (!message) {
    throw new Error("You are not authorized to update this identity request", {
      cause: { status: 403 },
    });
  }

  if (request.status !== "pending") {
    throw conflictError("Identity request has already been processed");
  }

  if (status === "rejected") {
    const rejected = await IdentityRequest.findOneAndUpdate(
      { _id: requestId, status: "pending" },
      { $set: { status: "rejected", isActive: false } },
      { returnDocument: "after", runValidators: true },
    );

    if (!rejected) {
      throw conflictError("Identity request has already been processed");
    }

    return {
      id: rejected.id,
      messageId: rejected.messageId.toString(),
      status: rejected.status,
      updatedAt: rejected.updatedAt,
    };
  }

  const session = await mongoose.startSession();
  let acceptedRequest;
  let conversation;

  try {
    await session.withTransaction(async () => {
      acceptedRequest = await identityRequestRepository.acceptPending(
        requestId,
        session,
      );

      if (!acceptedRequest) {
        throw conflictError("Identity request has already been processed");
      }
      if (await blockRepository.existsBetween(senderId, message.receiverId).session(session)) {
        throw new Error("A conversation cannot be created while either user blocks the other", { cause: { status: 403 } });
      }

      [conversation] = await Conversation.create(
        [
          {
            participants: [senderId, message.receiverId],
            userState: [
              { userId: senderId },
              { userId: message.receiverId },
            ],
            anonymousMessageId: request.messageId,
            identityRequestId: requestId,
          },
        ],
        { session },
      );
    });
  } catch (error) {
    if (error.code === 11000) {
      throw conflictError("An identity request was already accepted");
    }
    throw error;
  } finally {
    await session.endSession();
  }

  return {
    id: acceptedRequest.id,
    messageId: acceptedRequest.messageId.toString(),
    status: acceptedRequest.status,
    updatedAt: acceptedRequest.updatedAt,
    conversationId: conversation.id,
  };
};

const getAuthorizedConversation = async (conversationId, userId) => {
  isValidObjectId([conversationId, userId]);
  const conversation = await conversationRepository.findForParticipant(
    conversationId,
    userId,
  );

  if (!conversation || conversation.userState.find((state) => state.userId.toString() === userId)?.hiddenAt) {
    const exists = await Conversation.exists({ _id: conversationId });
    throw new Error(
      exists ? "You are not authorized to access this conversation" : "Conversation not found",
      { cause: { status: exists ? 403 : 404 } },
    );
  }

  const otherParticipant = conversation.participants.find((id) => id.toString() !== userId);
  if (otherParticipant && await blockRepository.existsBetween(userId, otherParticipant)) {
    throw new Error("Messaging is not allowed between these users", { cause: { status: 403 } });
  }

  return conversation;
};

export const getConversationsService = async (userId, query) => {
  isValidObjectId(userId);
  const { page, limit, skip } = pageOptions(query);
  const [conversations, totalItems] = await Promise.all([
    conversationRepository.findAllForParticipant(userId, { skip, limit }),
    conversationRepository.countForParticipant(userId),
  ]);
  const participants = await userRepository.findPublicByIds(
    conversations.flatMap((conversation) => conversation.participants),
  );
  const participantsById = new Map(
    participants.map((participant) => [participant._id.toString(), participant]),
  );

  return paginatedResult(
    conversations.map((conversation) => ({
      id: conversation._id.toString(),
      anonymousMessageId: conversation.anonymousMessageId.toString(),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      readAt: conversation.userState.find((state) => state.userId.toString() === userId)?.readAt,
      participants: conversation.participants.flatMap((id) => {
        const participant = participantsById.get(id.toString());
        return participant
          ? [{
              id: participant._id.toString(),
              userName: participant.userName,
              firstName: participant.firstName,
              lastName: participant.lastName,
              avatar: participant.avatar,
            }]
          : [];
      }),
    })),
    page,
    limit,
    totalItems,
  );
};

export const getSentMessagesService = async (userId, query) => {
  const { page, limit, skip } = pageOptions(query);
  const [messages, totalItems] = await Promise.all([
    messageRepository.findSent(userId, { skip, limit }),
    messageRepository.countSent(userId),
  ]);
  return paginatedResult(messages.map(({ _id, receiverId, content, createdAt }) => ({
    id: _id.toString(), receiverId: receiverId.toString(), content, createdAt,
  })), page, limit, totalItems);
};

export const deleteMessageService = async (userId, id) => {
  isValidObjectId([userId, id]);
  const message = await messageRepository.deleteForSender(id, userId);
  if (!message) throw new Error("Message not found", { cause: { status: 404 } });
  return message;
};

const requireConversation = async (userId, id) => {
  isValidObjectId([userId, id]);
  const conversation = await conversationRepository.findForParticipantById(id, userId);
  if (!conversation || conversation.userState.find((state) => state.userId.toString() === userId)?.hiddenAt) {
    throw new Error("Conversation not found", { cause: { status: 404 } });
  }
  return conversation;
};

export const getConversationService = async (userId, id) => {
  const conversation = await requireConversation(userId, id);
  if (conversation.userState.find((state) => state.userId.toString() === userId)?.hiddenAt) {
    throw new Error("Conversation not found", { cause: { status: 404 } });
  }
  const participants = await userRepository.findPublicByIds(conversation.participants);
  return {
    id: conversation.id,
    participants: participants.map(({ _id, userName, firstName, lastName, avatar }) => ({ id: _id.toString(), userName, firstName, lastName, avatar })),
    readAt: conversation.userState.find((state) => state.userId.toString() === userId)?.readAt,
    anonymousMessageId: conversation.anonymousMessageId.toString(),
  };
};

export const markConversationReadService = async (userId, id) => {
  const conversation = await conversationRepository.markRead(id, userId);
  if (!conversation) throw new Error("Conversation not found", { cause: { status: 404 } });
  return { id: conversation.id, readAt: conversation.userState.find((state) => state.userId.toString() === userId)?.readAt };
};

export const hideConversationService = async (userId, id) => {
  const conversation = await conversationRepository.hide(id, userId);
  if (!conversation) throw new Error("Conversation not found", { cause: { status: 404 } });
  return { id: conversation.id };
};

export const sendConversationMessageService = async (senderId, conversationId, content) => {
  const conversation = await getAuthorizedConversation(conversationId, senderId);
  const message = await ConversationMessage.create({
    conversationId: conversation.id,
    senderId,
    content,
  });

  await conversationRepository.findByIdAndUpdate(conversation.id, {
    $set: { updatedAt: message.createdAt },
  });

  return {
    id: message.id,
    conversationId: message.conversationId.toString(),
    senderId: message.senderId.toString(),
    content: message.content,
    createdAt: message.createdAt,
  };
};

export const getConversationMessagesService = async (userId, conversationId, query) => {
  const conversation = await getAuthorizedConversation(conversationId, userId);
  const { page, limit, skip } = pageOptions(query);
  const [messages, totalItems, participants] = await Promise.all([
    conversationMessageRepository.findByConversation(conversation.id, {
      skip,
      limit,
    }),
    conversationMessageRepository.countByConversation(conversation.id),
    userRepository.findPublicByIds(conversation.participants),
  ]);

  return {
    conversation: {
      id: conversation.id,
      anonymousMessageId: conversation.anonymousMessageId.toString(),
      participants: participants.map((participant) => ({
        id: participant._id.toString(),
        userName: participant.userName,
        firstName: participant.firstName,
        lastName: participant.lastName,
        avatar: participant.avatar,
      })),
    },
    ...paginatedResult(
      messages.map(({ _id, senderId, content, createdAt, updatedAt }) => ({
        id: _id.toString(),
        senderId: senderId.toString(),
        content,
        createdAt,
        updatedAt,
      })),
      page,
      limit,
      totalItems,
    ),
  };
};
