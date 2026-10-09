import { Router } from "express";
import {
  DeleteUserById,
  getAllUsers,
  updateUserById,
  userByUserName,
} from "./admin.service.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  AdminUpdateValidator,
  userSearchByUserNameValidator,
} from "./admin.zod.js";
const router = Router();

router.delete("/delete/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await DeleteUserById(id);
    res.status(200).json({
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/edit/user/:id",
  validate(AdminUpdateValidator),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await updateUserById(id, req.validate.body);
      res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/users", async (_req, res, next) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/user{/:userName}",
  validate(userSearchByUserNameValidator),
  async (req, res, next) => {
    try {
      const { userName: queryUserName } = req.validate.query;
      const { userName: paramUserName } = req.validate.params;

      const userName = paramUserName || queryUserName;

      const user = await userByUserName(userName);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
