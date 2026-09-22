import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  updateEmailValidator,
  updatePasswordValidator,
  updateProfileValidator,
} from "./user.zod.js";
import {
  deleteMeService,
  GetAllUsersService,
  GetMyInfo,
  UpdateEmailService,
  updatePasswordService,
  UpdateProfileService,
} from "./user.service.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

router.get("/getUsers", async (_req, res, next) => {
  try {
    const data = await GetAllUsersService();
    res.status(200).json({
      data,
    });
  } catch (error) {
    next(error);
  }
});

// Protected routes

router.use(authenticate);

router.get("/profile", async (req, res, next) => {
  try {
    const data = await GetMyInfo(req.user.id);

    res.json({
      data,
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/update-profile",
  validate(updateProfileValidator),
  async (req, res, next) => {
    try {
      const result = await UpdateProfileService(req.user.id, req.body);

      res.status(200).json({
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/update-email",
  validate(updateEmailValidator),
  async (req, res, next) => {
    try {
      const result = await UpdateEmailService(req.user.id, req.body);

      res.status(200).json({
        message: "Email updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/update-password",
  validate(updatePasswordValidator),
  async (req, res, next) => {
    try {
      const result = await updatePasswordService(req.user.id, req.body);

      res.status(200).json({
        message: "Password updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete("/delete/me", async (req, res, next) => {
  try {
    const result = await deleteMeService(req.user.id);

    res.status(200).json({
      message: "User deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
