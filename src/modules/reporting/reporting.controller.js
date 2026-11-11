import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createMessageReportValidator,
  createUserReportValidator,
  getReportsValidator,
} from "./reporting.zod.js";
import {
  getMyReportsService,
  reportMessageService,
  reportUserService,
} from "./reporting.service.js";

const router = Router();

router.post(
  "/messages/:messageId",
  validate(createMessageReportValidator),
  async (req, res, next) => {
    try {
      const data = await reportMessageService(
        req.user.id,
        req.validate.params.messageId,
        req.validate.body,
      );
      res.status(201).json({ message: "Message reported successfully", data });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/users/:userId",
  validate(createUserReportValidator),
  async (req, res, next) => {
    try {
      const data = await reportUserService(
        req.user.id,
        req.validate.params.userId,
        req.validate.body,
      );
      res.status(201).json({ message: "User reported successfully", data });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/mine", validate(getReportsValidator), async (req, res, next) => {
  try {
    res
      .status(200)
      .json(await getMyReportsService(req.user.id, req.validate.query));
  } catch (error) {
    next(error);
  }
});

export default router;
