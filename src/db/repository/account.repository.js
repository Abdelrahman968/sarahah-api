import Account from "../models/account.model.js";
import BaseRepository from "./base.repository.js";

class AccountRepository extends BaseRepository {
  constructor() {
    super(Account);
  }

  async findByProviderAccountId(provider, providerAccountId) {
    return Account.findOne({
      provider,
      providerAccountId,
    }).populate("user");
  }

  async createAccount(data) {
    return Account.create(data);
  }

  async findByUserAndProvider(userId, provider) {
    return Account.findOne({
      user: userId,
      provider,
    });
  }
}

export default new AccountRepository();
