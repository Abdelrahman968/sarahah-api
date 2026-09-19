import { Router } from "express";
import { DeleteUserById, updateUserById } from "./admin.service.js";
import { validate } from "../../middleware/validate.middleware.js";
import { AdminUpdateUserValidator } from "./admin.zod.js";
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
  validate(AdminUpdateUserValidator),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await updateUserById(id, req.body);
      res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
