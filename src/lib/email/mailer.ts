import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function getFromAddress() {
  const smtpUser = process.env.SMTP_USER || 'no-reply@prompt2form.vercel.app';
  return {
    name: 'Prompt2Form',
    address: smtpUser,
  };
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://prompt2form.vercel.app';
}

// ─── Base Email Template (Bulletproof HTML) ──────────────────────────────────

function renderEmailTemplate({
  badgeText,
  title,
  subtitle,
  actionUrl,
  buttonText,
  expiryNote,
}: {
  badgeText: string;
  title: string;
  subtitle: string;
  actionUrl: string;
  buttonText: string;
  expiryNote: string;
}): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Prompt2Form</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; width: 100%; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #121215; border: 1px solid #27272a; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Top Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #7c3aed 0%, #c084fc 50%, #6366f1 100%);"></td>
          </tr>

          <!-- Header / Logo -->
          <tr>
            <td style="padding: 36px 40px 24px 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 10px; width: 36px; height: 36px; text-align: center; vertical-align: middle; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);">
                          <span style="color: #ffffff; font-size: 16px; font-weight: 800; font-family: monospace; line-height: 36px;">P2F</span>
                        </td>
                        <td style="padding-left: 12px;">
                          <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.5px;">Prompt2Form</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #27272a; width: 100%;"></div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 40px 40px 40px;">
              
              <!-- Badge -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="background-color: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 100px; padding: 4px 12px;">
                    <span style="color: #c084fc; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h1 style="margin: 0 0 16px 0; color: #ffffff; font-size: 26px; font-weight: 700; line-height: 1.25; letter-spacing: -0.5px;">
                ${title}
              </h1>

              <!-- Subtitle / Body -->
              <p style="margin: 0 0 28px 0; color: #a1a1aa; font-size: 15px; line-height: 1.6;">
                ${subtitle}
              </p>

              <!-- CTA Button -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px; width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${actionUrl}" target="_blank" style="display: inline-block; width: 100%; text-align: center; box-sizing: border-box; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4); border: 1px solid rgba(255,255,255,0.1);">
                      ${buttonText} &nbsp;&rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Direct Link Card -->
              <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; font-weight: 500;">
                  If the button above does not work, copy and paste this link into your browser:
                </p>
                <p style="margin: 0; word-break: break-all; font-family: monospace; font-size: 12px; color: #c084fc; line-height: 1.4;">
                  ${actionUrl}
                </p>
              </div>

              <!-- Expiry & Security Note -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(39, 39, 42, 0.4); border-radius: 10px; padding: 12px 16px;">
                <tr>
                  <td style="color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                    Security Note: ${expiryNote}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0d0d10; border-top: 1px solid #27272a; padding: 24px 40px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #71717a; font-size: 12px;">
                Designed with AI by <strong>Prompt2Form</strong>
              </p>
              <p style="margin: 0; color: #52525b; font-size: 11px;">
                &copy; ${year} Prompt2Form. All rights reserved. You received this email because of an account action on Prompt2Form.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send Verify Email ────────────────────────────────────────────────────────

export async function sendVerifyEmail(
  to: string,
  name: string,
  rawToken: string,
): Promise<void> {
  const verifyUrl = `${getAppUrl()}/verify-email/${rawToken}`;

  const html = renderEmailTemplate({
    badgeText: 'Account Verification',
    title: 'Verify your email address',
    subtitle: `Hi ${name}, thanks for creating an account on Prompt2Form! Please confirm your email address by clicking the button below to complete your registration.`,
    actionUrl: verifyUrl,
    buttonText: 'Verify Email Address',
    expiryNote: 'This link is valid for 24 hours. If you did not create a Prompt2Form account, please ignore this email.',
  });

  const text = `Hi ${name},\n\nThanks for signing up for Prompt2Form! Please verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThis link is valid for 24 hours.`;

  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: 'Verify your Prompt2Form account',
    text,
    html,
  });

  console.log('[sendVerifyEmail] Email sent cleanly. MessageId:', info.messageId);
}

// ─── Send Reset Password Email ────────────────────────────────────────────────

export async function sendResetPasswordEmail(
  to: string,
  name: string,
  rawToken: string,
): Promise<void> {
  const resetUrl = `${getAppUrl()}/reset-password/${rawToken}`;

  const html = renderEmailTemplate({
    badgeText: 'Password Reset',
    title: 'Reset your password',
    subtitle: `Hi ${name}, we received a request to reset the password for your Prompt2Form account. Click the button below to choose a new password.`,
    actionUrl: resetUrl,
    buttonText: 'Reset Password',
    expiryNote: 'This link is valid for 1 hour. If you did not request a password reset, please ignore this email.',
  });

  const text = `Hi ${name},\n\nWe received a request to reset your Prompt2Form password. Click the link below to choose a new password:\n\n${resetUrl}\n\nThis link is valid for 1 hour.`;

  const transporter = getTransporter();
  const info = await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: 'Reset your Prompt2Form password',
    text,
    html,
  });

  console.log('[sendResetPasswordEmail] Email sent cleanly. MessageId:', info.messageId);
}

// ─── Send Form Response Notification Email ────────────────────────────────────

export async function sendFormResponseNotification(
  to: string,
  formTitle: string,
  answers: Record<string, unknown>,
  formId: string,
): Promise<void> {
  const responsesUrl = `${getAppUrl()}/dashboard/forms/${formId}/responses`;

  const answersHtml = Object.entries(answers)
    .map(
      ([key, val]) =>
        `<tr><td style="padding: 8px 12px; font-size: 13px; font-weight: bold; color: #a1a1aa; border-bottom: 1px solid #27272a;">${key}</td><td style="padding: 8px 12px; font-size: 14px; color: #ffffff; border-bottom: 1px solid #27272a;">${String(val || '-')}</td></tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0; padding:20px; background:#09090b; font-family:sans-serif; color:#ffffff;">
  <div style="max-width:560px; margin:0 auto; background:#121215; border:1px solid #27272a; border-radius:16px; p-6; padding:24px;">
    <h2 style="margin:0 0 8px 0; font-size:20px; color:#ffffff;">New Response Received! 🎉</h2>
    <p style="margin:0 0 16px 0; font-size:14px; color:#a1a1aa;">Someone submitted your form <strong>"${formTitle}"</strong>.</p>
    <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px; border-collapse:collapse;">
      ${answersHtml}
    </table>
    <a href="${responsesUrl}" style="display:inline-block; padding:12px 24px; background:#7c3aed; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:bold; font-size:14px;">View All Responses →</a>
  </div>
</body>
</html>`;

  const text = `New response received for "${formTitle}"!\n\n${Object.entries(answers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')}\n\nView details: ${responsesUrl}`;

  const transporter = getTransporter();
  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject: `[New Response] ${formTitle}`,
    text,
    html,
  });
}
