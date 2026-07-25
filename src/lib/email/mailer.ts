import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST || 'emirhankurtulus.com';
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
    connectionTimeout: 10000, // 10s connection timeout for serverless
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function getFromAddress() {
  return process.env.SMTP_USER || 'hello@emirhankurtulus.com';
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
<html>
<head>
  <meta charset="utf-8">
  <title>Prompt2Form</title>
</head>
<body style="margin:0; padding:20px; background-color:#09090b; font-family:Helvetica, Arial, sans-serif; color:#ffffff;">
  <div style="max-width:540px; margin:0 auto; background-color:#121215; border:1px solid #27272a; border-radius:12px; padding:32px;">
    
    <div style="margin-bottom:24px;">
      <span style="display:inline-block; background-color:#27272a; color:#a1a1aa; font-size:11px; font-weight:bold; padding:4px 10px; border-radius:4px; text-transform:uppercase;">
        ${badgeText}
      </span>
    </div>

    <h1 style="margin:0 0 16px 0; color:#ffffff; font-size:22px; font-weight:bold;">
      ${title}
    </h1>

    <p style="margin:0 0 24px 0; color:#a1a1aa; font-size:14px; line-height:1.6;">
      ${subtitle}
    </p>

    <div style="margin-bottom:28px;">
      <a href="${actionUrl}" target="_blank" style="display:inline-block; background-color:#ffffff; color:#09090b; text-decoration:none; font-size:14px; font-weight:bold; padding:12px 24px; border-radius:8px;">
        ${buttonText}
      </a>
    </div>

    <div style="background-color:#18181b; border:1px solid #27272a; border-radius:8px; padding:12px; margin-bottom:20px;">
      <p style="margin:0 0 6px 0; color:#71717a; font-size:11px;">
        Direct Link:
      </p>
      <a href="${actionUrl}" target="_blank" style="color:#a1a1aa; font-size:11px; word-break:break-all;">
        ${actionUrl}
      </a>
    </div>

    <p style="margin:0 0 20px 0; color:#71717a; font-size:11px;">
      ${expiryNote}
    </p>

    <div style="border-top:1px solid #27272a; padding-top:16px; font-size:11px; color:#52525b; text-align:center;">
      Prompt2Form &copy; ${year} — AI-Powered Form Builder
    </div>

  </div>
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

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: getFromAddress(),
      sender: process.env.SMTP_USER || 'hello@emirhankurtulus.com',
      replyTo: process.env.SMTP_USER || 'hello@emirhankurtulus.com',
      to,
      subject: 'Verify your Prompt2Form account',
      text,
      html,
    });

    console.log('[sendVerifyEmail] Email sent cleanly to:', to, 'MessageId:', info.messageId);
  } catch (err) {
    console.error('[sendVerifyEmail Error]:', err);
    throw err;
  }
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
    replyTo: process.env.SMTP_USER || 'hello@emirhankurtulus.com',
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
  const info = await transporter.sendMail({
    from: getFromAddress(),
    replyTo: process.env.SMTP_USER || 'hello@emirhankurtulus.com',
    to,
    subject: `[New Response] ${formTitle}`,
    text,
    html,
  });

  console.log('[sendFormResponseNotification] Email sent cleanly. MessageId:', info.messageId);
}
