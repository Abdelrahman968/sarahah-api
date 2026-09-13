import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import {
  loginValidator,
  updateEmailValidator,
  updatePasswordValidator,
  updateProfileValidator,
  UserRegisterValidator,
} from "./user.zod.js";
import {
  CreateUserService,
  LoginUserService,
  LogoutService,
  RefreshTokenService,
  UpdateEmailService,
  updatePasswordService,
  UpdateProfileService,
} from "./user.service.js";
import User from "../../db/models/user.model.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "../../utils/cookie.js";

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

      const result = await CreateUserService(body);

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

    const { refreshToken, ...data } = result;

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      message: "Login Successfully",
      data: data,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

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
    const refreshToken = req.cookies.refreshToken;

    await LogoutService(refreshToken);

    clearRefreshTokenCookie(res);

    res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/profile", authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/update-profile",
  authenticate,
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
  authenticate,
  validate(updateEmailValidator),
  async (req, res, next) => {
    try {
      const result = await UpdateEmailService(req.user.id, req.body);

      res.status(200).json({
        message: "Email updated successfully",
        newEmail: req.body.email,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/update-password",
  authenticate,
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
