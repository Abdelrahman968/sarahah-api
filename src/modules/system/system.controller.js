import { Router } from "express";
import { checkHealthService, GetAllUsersService } from "./system.service.js";

const router = Router();

router.get("/health", async (req, res) => {
  const result = await checkHealthService();

  return res.status(200).json(result);
});

router.get("/get-users", async (_req, res, next) => {
  try {
    const data = await GetAllUsersService();
    res.status(200).json({
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
