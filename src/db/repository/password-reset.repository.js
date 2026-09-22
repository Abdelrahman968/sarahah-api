import PasswordReset from "../models/password-reset.model.js";
import BaseRepository from "./base.repository.js";

class PasswordResetRepository extends BaseRepository {
  constructor() {
    super(PasswordReset);
  }
}

export default new PasswordResetRepository();
