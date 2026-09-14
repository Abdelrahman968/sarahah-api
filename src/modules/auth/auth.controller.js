import { Router } from "express";
import {
  RegisterUserService,
  LoginUserService,
  LogoutService,
  RefreshTokenService,
} from "./auth.service.js";

import { loginValidator, UserRegisterValidator } from "./auth.zod.js";

import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  CLIENT_URL,
  JWT_REFRESH_COOKIE_NAME,
} from "../../../config/env.config.js";
import { sendEmail } from "../../services/email/email.service.js";
import { newLoginEmailTemplate } from "../../services/email/templates/new-login.template.js";

const router = Router();

router.post(
  "/register",
  validate(UserRegisterValidator),
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, password, gender, age } = req.body;

      const body = {
        firstName,
        lastName,
        email,
        password,
        gender,
        age,
      };

      const result = await RegisterUserService(body);

      const { refreshToken, ...data } = result;

      setRefreshTokenCookie(res, refreshToken);

      res.status(201).json({
        message: "User created successfully",
        data: data,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post("/login", validate(loginValidator), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const body = {
      email,
      password,
    };

    const result = await LoginUserService(body);

    const { refreshToken, accessToken, user } = result;

    setRefreshTokenCookie(res, refreshToken);

    const html = newLoginEmailTemplate({
      name: user.firstName,
      email: user.email,
      loginTime: new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      ipAddress: req.ip,
      device: req.headers["user-agent"],
      securityUrl: `${CLIENT_URL}/account/security`,
    });

    sendEmail({
      to: user.email,
      subject: "New Login to Your Sarahah Account",
      html,
    }).catch((error) => {
      console.error("New Login email failed:", error);
    });

    res.status(200).json({
      message: "Login Successfully",
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const refreshToken = req.cookies[JWT_REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      throw new Error("Refresh token is required", {
        cause: { status: 401 },
      });
    }

    const result = await RefreshTokenService(refreshToken);

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = req.cookies[JWT_REFRESH_COOKIE_NAME];

    if (!refreshToken) {
      clearRefreshTokenCookie(res);
      return res.status(200).json({ message: "Logout successfully" });
    }

    await LogoutService(refreshToken);

    clearRefreshTokenCookie(res);

    res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
