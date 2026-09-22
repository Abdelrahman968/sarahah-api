import User from "../models/user.model.js";
import BaseRepository from "./base.repository.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async ensureEmailAvailable(email) {
    const exists = await this.exists({
      email: email.toLowerCase(),
    });

    if (exists) {
      throw new Error("Email already exists", {
        cause: {
          status: 409,
        },
      });
    }
  }

  async ensureEmailAvailableForUpdate(email, userId) {
    const exists = await this.exists({
      email: email.toLowerCase(),
      _id: { $ne: userId },
    });

    if (exists) {
      throw new Error("Email already exists", {
        cause: {
          status: 409,
        },
      });
    }
  }

  findByEmail(email, select) {
    return this.model
      .findOne({
        email: email.toLowerCase(),
      })
      .select(select);
  }

  findById(id, select) {
    return this.model.findById(id).select(select);
  }

  async updatePassword(id, password) {
    const user = await this.model.findById(id).select("+password");

    if (!user) {
      return null;
    }

    user.password = password;

    return user.save();
  }
}

export default new UserRepository();
