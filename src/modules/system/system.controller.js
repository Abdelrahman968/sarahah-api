import { Router } from "express";
import { checkHealthService } from "./system.service.js";
const router = Router();

router.get("/health", async (req, res) => {
  const result = await checkHealthService();

  return res.status(200).json(result);
});

export default router;
