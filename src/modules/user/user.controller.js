import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  forgotPasswordValidator,
  resetPasswordValidator,
  updateEmailValidator,
  updatePasswordValidator,
  updateProfileValidator,
} from "./user.zod.js";
import {
  ForgotPasswordService,
  GetProfileService,
  ResetPasswordService,
  UpdateEmailService,
  updatePasswordService,
  UpdateProfileService,
} from "./user.service.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { passwordChangedEmailTemplate } from "../../services/email/templates/password-change.template.js";
import { CLIENT_URL } from "../../../config/env.config.js";
import { sendEmail } from "../../services/email/email.service.js";

const router = Router();

router.post(
  "/forgot-password",
  validate(forgotPasswordValidator),
  async (req, res, next) => {
    try {
      const data = await ForgotPasswordService(req.body.email);
      res.status(200).json({
        data,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/reset-password",
  validate(resetPasswordValidator),
  async (req, res, next) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      const user = await ResetPasswordService(
        token,
        newPassword,
        confirmPassword,
      );

      const html = passwordChangedEmailTemplate({
        name: user.firstName,
        email: user.email,
        changedAt: new Date().toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        ipAddress: req.ip,
        device: req.get("user-agent"),
        securityUrl: `${CLIENT_URL}/account/security`,
      });

      sendEmail({
        to: user.email,
        subject: "Your Sarahah Password Was Changed",
        html,
      }).catch((error) => {
        console.error("Password changed email failed:", error);
      });

      res.status(200).json({
        message: "Password reset successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Protected routes

router.use(authenticate);

router.get("/profile", async (req, res, next) => {
  try {
    const data = await GetProfileService(req.user.id);

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

export default router;
