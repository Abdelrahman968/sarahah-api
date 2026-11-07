import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  conversationsValidator,
  conversationIdValidator,
  conversationMessagesValidator,
  identityRequestsValidator,
  messageIdValidator,
  receivedMessagesValidator,
  requestIdentityValidator,
  sendConversationMessageValidator,
  sendMessageValidator,
  updateIdentityRequestValidator,
} from "./messaging.zod.js";
import {
  getConversationMessagesService,
  getConversationsService,
  getConversationService,
  getSentMessagesService,
  deleteMessageService,
  markConversationReadService,
  hideConversationService,
  getIdentityRequestsService,
  getReceivedMessagesService,
  requestMessageIdentityService,
  sendAnonymousMessageService,
  sendConversationMessageService,
  updateIdentityRequestService,
} from "./messaging.service.js";

const router = Router();

router.post("/messages", validate(sendMessageValidator), async (req, res, next) => {
  try {
    const data = await sendAnonymousMessageService(req.user.id, req.validate.body);
    res.status(201).json({ message: "Anonymous message sent successfully", data });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/messages/received",
  validate(receivedMessagesValidator),
  async (req, res, next) => {
    try {
      const result = await getReceivedMessagesService(
        req.user.id,
        req.validate.query,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/messages/:messageId/identity-requests",
  validate(requestIdentityValidator),
  async (req, res, next) => {
    try {
      const data = await requestMessageIdentityService(
        req.user.id,
        req.validate.params.messageId,
      );
      res.status(201).json({ message: "Identity request created successfully", data });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/identity-requests",
  validate(identityRequestsValidator),
  async (req, res, next) => {
    try {
      const result = await getIdentityRequestsService(
        req.user.id,
        req.validate.query,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/identity-requests/:requestId",
  validate(updateIdentityRequestValidator),
  async (req, res, next) => {
    try {
      const data = await updateIdentityRequestService(
        req.user.id,
        req.validate.params.requestId,
        req.validate.body.status,
      );
      res.status(200).json({
        message: `Identity request ${data.status}`,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/conversations",
  validate(conversationsValidator),
  async (req, res, next) => {
    try {
      const result = await getConversationsService(
        req.user.id,
        req.validate.query,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

router.get("/messages/sent", validate(receivedMessagesValidator), async (req, res, next) => {
  try {
    res.status(200).json(await getSentMessagesService(req.user.id, req.validate.query));
  } catch (error) { next(error); }
});

router.delete("/messages/:id", validate(messageIdValidator), async (req, res, next) => {
  try {
    await deleteMessageService(req.user.id, req.validate.params.id);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) { next(error); }
});

router.get("/conversations/:id", validate(conversationIdValidator), async (req, res, next) => {
  try {
    res.status(200).json({ data: await getConversationService(req.user.id, req.validate.params.id) });
  } catch (error) { next(error); }
});

router.patch("/conversations/:id/read", validate(conversationIdValidator), async (req, res, next) => {
  try {
    res.status(200).json({ message: "Conversation marked as read", data: await markConversationReadService(req.user.id, req.validate.params.id) });
  } catch (error) { next(error); }
});

router.delete("/conversations/:id", validate(conversationIdValidator), async (req, res, next) => {
  try {
    res.status(200).json({ message: "Conversation hidden successfully", data: await hideConversationService(req.user.id, req.validate.params.id) });
  } catch (error) { next(error); }
});

router.post(
  "/conversations/:conversationId/messages",
  validate(sendConversationMessageValidator),
  async (req, res, next) => {
    try {
      const data = await sendConversationMessageService(
        req.user.id,
        req.validate.params.conversationId,
        req.validate.body.content,
      );
      res.status(201).json({ message: "Message sent successfully", data });
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/conversations/:conversationId/messages",
  validate(conversationMessagesValidator),
  async (req, res, next) => {
    try {
      const result = await getConversationMessagesService(
        req.user.id,
        req.validate.params.conversationId,
        req.validate.query,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
