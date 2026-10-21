import { CLIENT_URL } from "../../../../config/env.config.js";

export const verifyEmailTemplate = ({
  name,
  email,
  code,
  verifyUrl = CLIENT_URL,
}) => {
  const currentYear = new Date().getFullYear();
  const verifyLink = `${verifyUrl.replace(/\/$/, "")}/verify-email`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta name="x-apple-disable-message-reformatting" />
  <meta
    name="format-detection"
    content="telephone=no,address=no,email=no,date=no,url=no"
  />

  <title>Verify your email - Sarahah</title>

  <style>
    table,
    td,
    div,
    p,
    a {
      font-family: Arial, Helvetica, sans-serif !important;
    }
  </style>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    width: 100%;
    background-color: #f4f4f5;
    font-family: Arial, Helvetica, sans-serif;
    color: #18181b;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  "
>
  <div
    style="
      display: none;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      color: transparent;
      font-size: 1px;
      line-height: 1px;
    "
  >
    Verify your email address to activate your Sarahah account.
  </div>

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
    "
  >
    <tr>
      <td
        align="center"
        style="
          padding: 48px 16px;
        "
      >
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e4e4e7;
            border-radius: 18px;
            overflow: hidden;
          "
        >
          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                padding: 42px 32px 38px;
                background-color: #18181b;
              "
            >
              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    align="center"
                    valign="middle"
                    style="
                      width: 54px;
                      height: 54px;
                      background-color: #ffffff;
                      border-radius: 15px;
                    "
                  >
                    <span
                      style="
                        display: inline-block;
                        color: #18181b;
                        font-size: 25px;
                        line-height: 54px;
                        font-weight: 800;
                      "
                    >
                      S
                    </span>
                  </td>
                </tr>
              </table>

              <div
                style="
                  height: 20px;
                  line-height: 20px;
                  font-size: 1px;
                "
              >
                &nbsp;
              </div>

              <h1
                style="
                  margin: 0;
                  padding: 0;
                  color: #ffffff;
                  font-size: 29px;
                  line-height: 38px;
                  font-weight: 700;
                  letter-spacing: -0.5px;
                "
              >
                Verify your email
              </h1>

              <p
                style="
                  margin: 9px 0 0;
                  padding: 0;
                  color: #a1a1aa;
                  font-size: 14px;
                  line-height: 22px;
                "
              >
                Confirm your email address to continue.
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td
              style="
                padding: 42px 40px 40px;
              "
            >
              <p
                style="
                  margin: 0 0 7px;
                  padding: 0;
                  color: #71717a;
                  font-size: 12px;
                  line-height: 20px;
                  font-weight: 700;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                "
              >
                Email verification
              </p>

              <h2
                style="
                  margin: 0 0 18px;
                  padding: 0;
                  color: #18181b;
                  font-size: 26px;
                  line-height: 35px;
                  font-weight: 700;
                  letter-spacing: -0.5px;
                "
              >
                Hello, ${name} 👋
              </h2>

              <p
                style="
                  margin: 0 0 18px;
                  padding: 0;
                  color: #3f3f46;
                  font-size: 15px;
                  line-height: 27px;
                "
              >
                Thanks for creating your Sarahah account. Please verify your
                email address using the verification code below.
              </p>

              <!-- Account Email -->
<table
  role="presentation"
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  style="
    margin-bottom: 24px;
    background-color: #fafafa;
    border: 1px solid #e4e4e7;
    border-radius: 12px;
  "
>
  <tr>
    <td
      style="
        padding: 18px 20px;
      "
    >
      <p
        style="
          margin: 0 0 6px;
          padding: 0;
          color: #a1a1aa;
          font-size: 11px;
          line-height: 17px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        "
      >
        Account email
      </p>

      <p
        style="
          margin: 0;
          padding: 0;
          color: #27272a;
          font-size: 14px;
          line-height: 22px;
          font-weight: 600;
          word-break: break-word;
        "
      >
        ${email}
      </p>
    </td>
  </tr>
</table>

              <!-- Verification Code -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin: 0 0 30px;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 12px;
                "
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 24px 20px;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 10px;
                        padding: 0;
                        color: #a1a1aa;
                        font-size: 11px;
                        line-height: 17px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                        text-transform: uppercase;
                      "
                    >
                      Verification code
                    </p>

                    <p
                      style="
                        margin: 0;
                        padding: 0;
                        color: #18181b;
                        font-size: 32px;
                        line-height: 40px;
                        font-weight: 700;
                        letter-spacing: 8px;
                        font-family: Arial, Helvetica, sans-serif;
                      "
                    >
                      ${code}
                    </p>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin: 0 0 30px;
                  padding: 0;
                  color: #3f3f46;
                  font-size: 15px;
                  line-height: 27px;
                "
              >
                Enter this code in Sarahah to verify your email address.
                For your security, don't share this code with anyone.
              </p>

              <!-- Verify Button -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td align="center">

                    <!--[if mso]>
                    <v:roundrect
                      xmlns:v="urn:schemas-microsoft-com:vml"
                      xmlns:w="urn:schemas-microsoft-com:office:word"
                      href="${verifyLink}"
                      style="
                        height:52px;
                        v-text-anchor:middle;
                        width:190px;
                      "
                      arcsize="15%"
                      fillcolor="#18181b"
                      strokecolor="#18181b"
                    >
                      <w:anchorlock />
                      <center
                        style="
                          color:#ffffff;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:15px;
                          font-weight:bold;
                        "
                      >
                        Verify Email
                      </center>
                    </v:roundrect>
                    <![endif]-->

                    <a
                      href="${verifyLink}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        display: inline-block;
                        width: 190px;
                        box-sizing: border-box;
                        padding: 16px 24px;
                        background-color: #18181b;
                        border: 1px solid #18181b;
                        border-radius: 10px;
                        color: #ffffff;
                        text-decoration: none;
                        text-align: center;
                        font-size: 15px;
                        line-height: 20px;
                        font-weight: 700;
                      "
                    >
                      Verify Email&nbsp;&nbsp;→
                    </a>

                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-top: 34px;
                "
              >
                <tr>
                  <td
                    style="
                      height: 1px;
                      background-color: #e4e4e7;
                      font-size: 1px;
                      line-height: 1px;
                    "
                  >
                    &nbsp;
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin: 26px 0 7px;
                  padding: 0;
                  color: #71717a;
                  font-size: 12px;
                  line-height: 19px;
                "
              >
                If the button doesn't work, copy and paste this link:
              </p>

              <p
                style="
                  margin: 0;
                  padding: 0;
                  font-size: 12px;
                  line-height: 20px;
                  word-break: break-all;
                "
              >
                <a
                  href="${verifyLink}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    color: #52525b;
                    text-decoration: underline;
                  "
                >
                  ${verifyLink}
                </a>
              </p>

              <!-- Security Note -->
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-top: 28px;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 10px;
                "
              >
                <tr>
                  <td
                    style="
                      padding: 15px 17px;
                    "
                  >
                    <p
                      style="
                        margin: 0;
                        padding: 0;
                        color: #71717a;
                        font-size: 12px;
                        line-height: 20px;
                      "
                    >
                      <strong style="color: #3f3f46;">
                        Security note:
                      </strong>
                      If you didn't create a Sarahah account, you can safely
                      ignore this email. Never share your verification code.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding: 27px 32px;
                background-color: #fafafa;
                border-top: 1px solid #e4e4e7;
              "
            >
              <p
                style="
                  margin: 0 0 7px;
                  padding: 0;
                  color: #3f3f46;
                  font-size: 13px;
                  line-height: 20px;
                  font-weight: 700;
                "
              >
                Sarahah
              </p>

              <p
                style="
                  margin: 0;
                  padding: 0;
                  color: #a1a1aa;
                  font-size: 11px;
                  line-height: 18px;
                "
              >
                © ${currentYear} Sarahah. All rights reserved.
              </p>
            </td>
          </tr>
        </table>

        <div
          style="
            height: 20px;
            line-height: 20px;
            font-size: 1px;
          "
        >
          &nbsp;
        </div>

        <p
          style="
            margin: 0;
            padding: 0 16px;
            color: #a1a1aa;
            font-size: 10px;
            line-height: 17px;
          "
        >
          This is an automated message. Please do not reply to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
