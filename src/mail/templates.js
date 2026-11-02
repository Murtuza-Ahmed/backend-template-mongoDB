import { env } from "#src/config/env.js";

// Premium branded layout shared by every template.
// APP_NAME comes from env so the template stays generic — rename once,
// and every email follows.
function layout({ title, heading, bodyHtml }) {
  const app = env.appName;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
<div style="background:#111827;padding:32px 24px;text-align:center;">
<div style="color:#f59e0b;font-size:22px;font-weight:800;letter-spacing:3px;">${app.toUpperCase()}</div>
<div style="color:#9ca3af;font-size:12px;letter-spacing:1px;margin-top:6px;">${title}</div>
</div>
<div style="padding:32px 28px;color:#1f2937;">
<h2 style="margin:0 0 16px;font-size:20px;">${heading}</h2>
${bodyHtml}
</div>
<div style="padding:20px 28px;background:#f9fafb;color:#9ca3af;font-size:12px;text-align:center;border-top:1px solid #e5e7eb;">
This email was sent by ${app}. If you didn't ask for it, you can safely ignore it.
</div>
</div></body></html>`;
}

function codeBox(code) {
  return `<div style="text-align:center;margin:24px 0;">
<div style="display:inline-block;background:#111827;color:#f59e0b;font-size:34px;font-weight:800;letter-spacing:10px;padding:16px 24px 16px 34px;border-radius:10px;">${code}</div>
</div>`;
}

const note = (text) =>
  `<p style="font-size:13px;color:#6b7280;line-height:1.6;">${text}</p>`;

export const mailTemplates = {
  verifyEmail: (code, minutes) =>
    layout({
      title: "EMAIL VERIFICATION",
      heading: "Verify your email address",
      bodyHtml: `<p style="font-size:14px;line-height:1.6;">Use the code below to verify your email. It expires in <strong>${minutes} minutes</strong>.</p>
${codeBox(code)}
${note("If you didn't create an account, just ignore this email.")}`,
    }),

  welcome: (name) =>
    layout({
      title: "WELCOME",
      heading: `Welcome aboard, ${name}! 🎉`,
      bodyHtml: `<p style="font-size:14px;line-height:1.6;">Your email is verified and your account is ready. We're glad to have you with us.</p>`,
    }),

  resetPassword: (resetUrl, minutes = 15) =>
    layout({
      title: "PASSWORD RESET",
      heading: "Reset your password",
      bodyHtml: `<p style="font-size:14px;line-height:1.6;">Click the button below to set a new password. The link expires in <strong>${minutes} minutes</strong>.</p>
<div style="text-align:center;margin:24px 0;">
<a href="${resetUrl}" style="display:inline-block;background:#111827;color:#f59e0b;font-weight:700;padding:14px 32px;border-radius:8px;text-decoration:none;">Reset password</a>
</div>
${note("If the button doesn't work, copy this link into your browser:<br>" + resetUrl)}
${note("Didn't ask for this? Your password is safe — just ignore this email.")}`,
    }),

  passwordChanged: () =>
    layout({
      title: "SECURITY NOTICE",
      heading: "Your password was changed",
      bodyHtml: `<p style="font-size:14px;line-height:1.6;">This is a confirmation that your password was just changed. All other sessions were signed out.</p>
${note("If this wasn't you, reset your password immediately and contact support.")}`,
    }),

  emailChanged: (newEmail) =>
    layout({
      title: "SECURITY NOTICE",
      heading: "Your email was changed",
      bodyHtml: `<p style="font-size:14px;line-height:1.6;">Your account email is now <strong>${newEmail}</strong>. All sessions were signed out for your safety.</p>
${note("If this wasn't you, contact support right away.")}`,
    }),
};
