import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import { blockUserValidator } from "./blocking.zod.js";
import { blockUserService, getBlockedUsersService, unblockUserService } from "./blocking.service.js";

const router = Router();

router.post("/:userId", validate(blockUserValidator), async (req, res, next) => {
  try {
    const data = await blockUserService(req.user.id, req.validate.params.userId);
    res.status(201).json({ message: "User blocked successfully", data });
  } catch (error) { next(error); }
});

router.delete("/:userId", validate(blockUserValidator), async (req, res, next) => {
  try {
    const data = await unblockUserService(req.user.id, req.validate.params.userId);
    res.status(200).json({ message: "User unblocked successfully", data });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    res.status(200).json({ data: await getBlockedUsersService(req.user.id) });
  } catch (error) { next(error); }
});

export default router;
