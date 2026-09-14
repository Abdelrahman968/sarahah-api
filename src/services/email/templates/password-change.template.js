export const passwordChangedEmailTemplate = ({
  name,
  email,
  changedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }),
  ipAddress,
  device,
  location,
  securityUrl,
}) => {
  const currentYear = new Date().getFullYear();

  const escapeHtml = (value = "") =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeChangedAt = escapeHtml(changedAt);
  const safeIpAddress = escapeHtml(ipAddress);
  const safeDevice = escapeHtml(device);
  const safeLocation = escapeHtml(location);
  const safeSecurityUrl = escapeHtml(securityUrl);

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

  <title>Password Changed</title>

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
    Your Sarahah password has been successfully changed.
  </div>

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="width: 100%; background-color: #f4f4f5;"
  >
    <tr>
      <td align="center" style="padding: 48px 16px;">

        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            border: 1px solid #e4e4e7;
            border-radius: 18px;
            overflow: hidden;
          "
        >

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

              <div style="height: 20px; line-height: 20px; font-size: 1px;">
                &nbsp;
              </div>

              <h1
                style="
                  margin: 0;
                  padding: 0;
                  color: #ffffff;
                  font-size: 28px;
                  line-height: 38px;
                  font-weight: 700;
                  letter-spacing: -0.5px;
                "
              >
                Password Changed
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
                Your account password was successfully updated.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 42px 40px 40px;">

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
                Security Notification
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
                Hello, ${safeName} 👋
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
                Your Sarahah account password has been changed successfully.
                If you made this change, no further action is required.
              </p>

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin: 28px 0 30px;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 12px;
                "
              >

                <tr>
                  <td
                    style="
                      padding: 17px 20px;
                      border-bottom: 1px solid #e4e4e7;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 5px;
                        color: #71717a;
                        font-size: 12px;
                        line-height: 18px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      "
                    >
                      Account
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #18181b;
                        font-size: 14px;
                        line-height: 22px;
                        font-weight: 600;
                        word-break: break-word;
                      "
                    >
                      ${safeEmail}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 17px 20px;
                      border-bottom: 1px solid #e4e4e7;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 5px;
                        color: #71717a;
                        font-size: 12px;
                        line-height: 18px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      "
                    >
                      Changed At
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #18181b;
                        font-size: 14px;
                        line-height: 22px;
                        font-weight: 600;
                      "
                    >
                      ${safeChangedAt}
                    </p>
                  </td>
                </tr>

                ${
                  device
                    ? `
                <tr>
                  <td
                    style="
                      padding: 17px 20px;
                      border-bottom: 1px solid #e4e4e7;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 5px;
                        color: #71717a;
                        font-size: 12px;
                        line-height: 18px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      "
                    >
                      Device
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #18181b;
                        font-size: 14px;
                        line-height: 22px;
                        font-weight: 600;
                        word-break: break-word;
                      "
                    >
                      ${safeDevice}
                    </p>
                  </td>
                </tr>
                `
                    : ""
                }

                ${
                  location
                    ? `
                <tr>
                  <td
                    style="
                      padding: 17px 20px;
                      border-bottom: 1px solid #e4e4e7;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 5px;
                        color: #71717a;
                        font-size: 12px;
                        line-height: 18px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      "
                    >
                      Location
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #18181b;
                        font-size: 14px;
                        line-height: 22px;
                        font-weight: 600;
                        word-break: break-word;
                      "
                    >
                      ${safeLocation}
                    </p>
                  </td>
                </tr>
                `
                    : ""
                }

                ${
                  ipAddress
                    ? `
                <tr>
                  <td style="padding: 17px 20px;">
                    <p
                      style="
                        margin: 0 0 5px;
                        color: #71717a;
                        font-size: 12px;
                        line-height: 18px;
                        font-weight: 700;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                      "
                    >
                      IP Address
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #18181b;
                        font-size: 14px;
                        line-height: 22px;
                        font-weight: 600;
                        word-break: break-word;
                      "
                    >
                      ${safeIpAddress}
                    </p>
                  </td>
                </tr>
                `
                    : ""
                }

              </table>

              ${
                securityUrl
                  ? `
              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td align="center">

                    <v:roundrect
                      xmlns:v="urn:schemas-microsoft-com:vml"
                      href="${safeSecurityUrl}"
                      style="
                        height:48px;
                        v-text-anchor:middle;
                        width:220px;
                      "
                      arcsize="15%"
                      stroke="f"
                      fillcolor="#18181b"
                    >
                      <w:anchorlock/>
                      <center
                        style="
                          color:#ffffff;
                          font-family:Arial,Helvetica,sans-serif;
                          font-size:14px;
                          font-weight:700;
                        "
                      >
                        Review Account
                      </center>
                    </v:roundrect>

                    <a
                      href="${safeSecurityUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        display: inline-block;
                        padding: 15px 28px;
                        background-color: #18181b;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 10px;
                        font-size: 14px;
                        line-height: 18px;
                        font-weight: 700;
                      "
                    >
                      Review Account&nbsp;&nbsp;→
                    </a>

                  </td>
                </tr>
              </table>
              `
                  : ""
              }

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  margin-top: 30px;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 10px;
                "
              >
                <tr>
                  <td style="padding: 16px 18px;">

                    <p
                      style="
                        margin: 0;
                        color: #52525b;
                        font-size: 13px;
                        line-height: 22px;
                      "
                    >
                      <strong style="color: #18181b;">
                        Wasn't you?
                      </strong>
                      Your password may have been changed by someone else.
                      We recommend securing your account immediately and
                      reviewing your active sessions.
                    </p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

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
                  color: #18181b;
                  font-size: 14px;
                  line-height: 22px;
                  font-weight: 700;
                "
              >
                Sarahah
              </p>

              <p
                style="
                  margin: 0;
                  color: #a1a1aa;
                  font-size: 12px;
                  line-height: 20px;
                "
              >
                © ${currentYear} Sarahah. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

        <div style="height: 20px; line-height: 20px; font-size: 1px;">
          &nbsp;
        </div>

        <p
          style="
            margin: 0;
            color: #a1a1aa;
            font-size: 11px;
            line-height: 18px;
            text-align: center;
          "
        >
          This is an automated security email. Please do not reply.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
