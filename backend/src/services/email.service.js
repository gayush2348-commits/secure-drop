import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const getBackendUrl = () => {
  const url = process.env.BACKEND_URL;

  if (!url) {
    throw new Error("BACKEND_URL is not configured");
  }

  return url.replace(/\/+$/, "");
};

const getEmailSender = () => {
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM is not configured");
  }

  return process.env.EMAIL_FROM;
};

const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: getEmailSender(),
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error("EMAIL DELIVERY FAILED:", error);
    throw new Error("Email delivery failed");
  }

  console.log("Email accepted by provider:", data?.id);
  return data;
};

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${getBackendUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to: email,
    subject: "Verify your SecureDrop account",
    html: `
      <h2>Welcome to SecureDrop</h2>
      <p>Please verify your email address.</p>
      <p>
        <a href="${verificationUrl}">Verify Email</a>
      </p>
      <p>This link expires in 15 minutes.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${getBackendUrl()}/api/auth/reset-password?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to: email,
    subject: "Reset your SecureDrop password",
    html: `
      <h2>Password Reset</h2>
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
};
