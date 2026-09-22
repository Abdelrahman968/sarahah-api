import Session from "../models/session.model.js";
import BaseRepository from "./base.repository.js";

class SessionRepository extends BaseRepository {
  constructor() {
    super(Session);
  }
}

export default new SessionRepository();
