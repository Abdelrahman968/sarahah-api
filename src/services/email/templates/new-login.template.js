export const newLoginEmailTemplate = ({
  name,
  email,
  loginTime = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }),
  ipAddress,
  device,
  location,
  securityUrl,
}) => {
  const currentYear = new Date().getFullYear();

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

  <title>New Login to Your Sarahah Account</title>

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
    A new login was detected on your Sarahah account.
  </div>

  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      width: 100%;
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
                  font-size: 28px;
                  line-height: 38px;
                  font-weight: 700;
                  letter-spacing: -0.5px;
                "
              >
                New Login Detected
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
                A new sign-in was detected on your account.
              </p>

            </td>
          </tr>

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
                Security Alert
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
                We detected a new login to your Sarahah account.
                Here are the details of this activity:
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
                        color: #a1a1aa;
                        font-size: 11px;
                        line-height: 17px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                        text-transform: uppercase;
                      "
                    >
                      Account
                    </p>

                    <p
                      style="
                        margin: 0;
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
                        color: #a1a1aa;
                        font-size: 11px;
                        line-height: 17px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                        text-transform: uppercase;
                      "
                    >
                      Date & Time
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #27272a;
                        font-size: 14px;
                        line-height: 22px;
                        font-weight: 600;
                      "
                    >
                      ${loginTime}
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
                        color: #a1a1aa;
                        font-size: 11px;
                        line-height: 17px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                        text-transform: uppercase;
                      "
                    >
                      Device
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #27272a;
                        font-size: 14px;
                        line-height: 22px;
                        font-weight: 600;
                        word-break: break-word;
                      "
                    >
                      ${device}
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
                        color: #a1a1aa;
                        font-size: 11px;
                        line-height: 17px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                        text-transform: uppercase;
                      "
                    >
                      Location
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #27272a;
                        font-size: 14px;
                        line-height: 22px;
                        font-weight: 600;
                        word-break: break-word;
                      "
                    >
                      ${location}
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
                  <td
                    style="
                      padding: 17px 20px;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 5px;
                        color: #a1a1aa;
                        font-size: 11px;
                        line-height: 17px;
                        font-weight: 700;
                        letter-spacing: 0.8px;
                        text-transform: uppercase;
                      "
                    >
                      IP Address
                    </p>

                    <p
                      style="
                        margin: 0;
                        color: #27272a;
                        font-size: 14px;
                        line-height: 22px;
                        font-weight: 600;
                        word-break: break-word;
                      "
                    >
                      ${ipAddress}
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
                      xmlns:w="urn:schemas-microsoft-com:office:word"
                      href="${securityUrl}"
                      style="
                        height:52px;
                        v-text-anchor:middle;
                        width:210px;
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
                        Review Account
                      </center>
                    </v:roundrect>

                    <a
                      href="${securityUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        display: inline-block;
                        width: 210px;
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
                  <td
                    style="
                      padding: 16px 18px;
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
                        Wasn't you?
                      </strong>
                      We recommend changing your password immediately
                      and reviewing your recent account activity.
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
          This is an automated security email. Please do not reply.
        </p>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
