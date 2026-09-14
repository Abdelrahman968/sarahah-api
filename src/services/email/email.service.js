import { MAIL_FROM } from "../../../config/env.config.js";
import { transporter } from "./email.transport.js";

export const sendEmail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: MAIL_FROM,
    to,
    subject,
    html,
  });
};
