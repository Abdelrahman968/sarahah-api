import { Router } from "express";
import {
  DeleteUserById,
  getAllUsers,
  updateUserById,
} from "./admin.service.js";
import { validate } from "../../middleware/validate.middleware.js";
import { AdminUpdateValidator } from "./admin.zod.js";
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
      const user = await updateUserById(id, req.validate);
      res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/users", async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
