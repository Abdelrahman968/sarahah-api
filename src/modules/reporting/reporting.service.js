import Report from "../../db/models/report.model.js";
import Message from "../../db/models/message.model.js";
import userRepository from "../../db/repository/user.repository.js";
import reportRepository from "../../db/repository/report.repository.js";
import { isValidObjectId } from "../../utils/validation/isValidObjectId.js";

const createReport = async (data) => {
  const report = await Report.create(data);
  return {
    id: report.id,
    targetType: report.targetType,
    messageId: report.messageId?.toString() ?? null,
    reportedUserId: report.reportedUserId?.toString() ?? null,
    reason: report.reason,
    details: report.details,
    status: report.status,
    createdAt: report.createdAt,
  };
};

export const reportMessageService = async (reporterId, messageId, body) => {
  isValidObjectId([reporterId, messageId]);
  const message = await Message.findById(messageId).select("receiverId").lean();
  if (!message) throw new Error("Message not found", { cause: { status: 404 } });
  if (message.receiverId.toString() !== reporterId) {
    throw new Error("Only the message receiver can report it", { cause: { status: 403 } });
  }
  return createReport({ reporterId, targetType: "message", messageId, reason: body.reason, details: body.details });
};

export const reportUserService = async (reporterId, reportedUserId, body) => {
  isValidObjectId([reporterId, reportedUserId]);
  if (reporterId === reportedUserId) throw new Error("You cannot report yourself", { cause: { status: 400 } });
  if (!(await userRepository.findById(reportedUserId, "_id"))) {
    throw new Error("User not found", { cause: { status: 404 } });
  }
  return createReport({ reporterId, targetType: "user", reportedUserId, reason: body.reason, details: body.details });
};

export const getMyReportsService = async (reporterId, { page, limit }) => {
  isValidObjectId(reporterId);
  const [reports, totalItems] = await Promise.all([
    Report.find({ reporterId }).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
    Report.countDocuments({ reporterId }),
  ]);
  return {
    data: reports.map(({ _id, targetType, messageId, reportedUserId, reason, details, status, createdAt, updatedAt, reviewedAt, action, adminNote }) => ({
      id: _id.toString(), targetType, messageId: messageId?.toString() ?? null,
      reportedUserId: reportedUserId?.toString() ?? null, reason, details, status,
      action, adminNote, createdAt, updatedAt, reviewedAt,
    })),
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
  };
};

export const getReportsForAdminService = async ({ page, limit, status }) => {
  const skip = (page - 1) * limit;
  const [reports, totalItems] = await Promise.all([
    reportRepository.findForAdmin({ status, skip, limit }),
    reportRepository.countForAdmin(status),
  ]);
  return {
    data: reports,
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
  };
};

export const getReportForAdminService = async (reportId) => {
  isValidObjectId(reportId);
  const report = await Report.findById(reportId)
    .populate("reporterId", "userName firstName lastName")
    .populate("reportedUserId", "userName firstName lastName")
    .lean();
  if (!report) throw new Error("Report not found", { cause: { status: 404 } });
  if (report.messageId) {
    report.message = await Message.findById(report.messageId).select("senderId receiverId content createdAt").lean();
  }
  return report;
};

export const updateReportService = async (adminId, reportId, body) => {
  isValidObjectId([adminId, reportId]);
  const report = await Report.findByIdAndUpdate(
    reportId,
    { $set: { status: body.status, action: body.action, adminNote: body.adminNote ?? null, adminId, reviewedAt: new Date() } },
    { returnDocument: "after", runValidators: true },
  );
  if (!report) throw new Error("Report not found", { cause: { status: 404 } });
  return report;
};
