import Report from "../models/report.model.js";
import BaseRepository from "./base.repository.js";

class ReportRepository extends BaseRepository {
  constructor() {
    super(Report);
  }

  findByReporter(reporterId) {
    return this.model.find({ reporterId }).sort({ createdAt: -1 });
  }

  findForAdmin({ status, skip, limit }) {
    const filter = status ? { status } : {};
    return this.model
      .find(filter)
      .populate("reporterId", "userName firstName lastName")
      .populate("reportedUserId", "userName firstName lastName")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit);
  }

  countForAdmin(status) {
    return this.model.countDocuments(status ? { status } : {});
  }
}

export default new ReportRepository();
