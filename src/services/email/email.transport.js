import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_USER,
} from "../../../config/env.config.js";

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,

  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});
