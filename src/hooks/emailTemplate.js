export function generateEmailTemplate(verificationCode) {
  return ` <body style="margin:0; padding:0; background-color:#f9f9f9; font-family: Arial, sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-inline-size:600px; background:#ffffff; border:1px solid #e5e5e5; border-radius:8px;">
      
      <!-- Header -->
      <!-- <tr>
        <td align="center" style="padding:20px; border-block-end:1px solid #eeeeee;">
          <h2 style="margin:0; font-size:20px; color:#333333;">YourApp</h2>
        </td>
      </tr> -->

      <!-- Body -->
      <tr>
        <td style="padding:30px 20px; text-align:center;">
          <h3 style="margin:0; font-size:18px; color:#333333;">Email Verification</h3>
          <p style="margin:15px 0; font-size:15px; color:#555555;">
            Use the following verification code to complete your sign in:
          </p>

          <!-- Verification Code -->
          <p style="margin:20px 0; font-size:28px; font-weight:bold; letter-spacing:4px; color:#4f46e5;">
            ${verificationCode}
          </p>

          <p style="margin:15px 0; font-size:14px; color:#777777;">
            This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td align="center" style="padding:15px; background:#f9f9f9; font-size:12px; color:#999999;">
          © 2025 YourApp. All rights reserved.
        </td>
      </tr>
    </table>
  </body>`
}