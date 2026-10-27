export const twoFactorSetupEmailTemplate = ({ name, otp, expiresIn = 5 }) => {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Confirm Two-Factor Authentication</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  width: 100%;
  background-color: #f4f4f5;
  font-family: Arial, Helvetica, sans-serif;
  color: #18181b;
">
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #f4f4f5; width: 100%;"
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
              style="padding: 42px 32px 38px; background-color: #18181b;"
            >
              <div style="
                width: 54px;
                height: 54px;
                line-height: 54px;
                background-color: #ffffff;
                border-radius: 15px;
                color: #18181b;
                font-size: 25px;
                font-weight: 800;
                text-align: center;
              ">
                S
              </div>

              <h1 style="
                margin: 24px 0 0;
                color: #ffffff;
                font-size: 28px;
                line-height: 38px;
              ">
                Confirm 2FA Setup
              </h1>

              <p style="
                margin: 9px 0 0;
                color: #a1a1aa;
                font-size: 14px;
                line-height: 22px;
              ">
                Add an extra layer of security to your account.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 42px 40px 40px;">
              <p style="
                margin: 0 0 7px;
                color: #71717a;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
              ">
                Security Verification
              </p>

              <h2 style="
                margin: 0 0 18px;
                color: #18181b;
                font-size: 26px;
                line-height: 35px;
              ">
                Hello, ${name} 👋
              </h2>

              <p style="
                margin: 0 0 24px;
                color: #3f3f46;
                font-size: 15px;
                line-height: 27px;
              ">
                Use the verification code below to confirm that you want to
                enable two-factor authentication on your Sarahah account.
              </p>

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 12px;
                "
              >
                <tr>
                  <td align="center" style="padding: 28px 16px;">
                    <p style="
                      margin: 0 0 12px;
                      color: #71717a;
                      font-size: 12px;
                      font-weight: 700;
                      letter-spacing: 1px;
                      text-transform: uppercase;
                    ">
                      Your Verification Code
                    </p>

                    <p style="
                      margin: 0;
                      color: #18181b;
                      font-size: 36px;
                      line-height: 44px;
                      font-weight: 800;
                      letter-spacing: 8px;
                    ">
                      ${otp}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="
                margin: 24px 0 0;
                color: #71717a;
                font-size: 13px;
                line-height: 22px;
                text-align: center;
              ">
                This code expires in
                <strong style="color: #18181b;">${expiresIn} minutes</strong>.
                Do not share it with anyone.
              </p>

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
                  <td style="padding: 16px 18px;">
                    <p style="
                      margin: 0;
                      color: #71717a;
                      font-size: 12px;
                      line-height: 20px;
                    ">
                      <strong style="color: #3f3f46;">
                        Didn't request this?
                      </strong>
                      Ignore this email. Two-factor authentication will not
                      be enabled unless the verification code is confirmed.
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
              <p style="
                margin: 0 0 7px;
                color: #3f3f46;
                font-size: 13px;
                font-weight: 700;
              ">
                Sarahah
              </p>

              <p style="
                margin: 0;
                color: #a1a1aa;
                font-size: 11px;
                line-height: 18px;
              ">
                © ${currentYear} Sarahah. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
