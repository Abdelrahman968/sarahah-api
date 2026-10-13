import BaseRepository from "./base.repository.js";
import Account from "../models/account.model.js";

class AccountRepository extends BaseRepository {
  constructor() {
    super(Account);
  }

  findByProviderAccountId(provider, providerAccountId) {
    return this.model.findOne({
      provider,
      providerAccountId,
    });
  }

  findPasswordAccount(userId) {
    return this.model
      .findOne({
        userId,
        provider: "password",
      })
      .select("+password");
  }

  async updatePassword(userId, password) {
    const account = await this.model
      .findOne({
        userId,
        provider: "password",
      })
      .select("+password");

    if (!account) {
      return null;
    }

    account.password = password;

    return account.save();
  }
}

export default new AccountRepository();
