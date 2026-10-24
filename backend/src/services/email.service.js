const API_URL = "https://sendliberty.com/api/send";

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
  const apiKey = process.env.SENDLIBERTY_API_KEY;

  if (!apiKey) {
    throw new Error("SENDLIBERTY_API_KEY is not configured");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailSender(),
      to,
      subject,
      html,
    }),
  });

  const responseText = await response.text();

  let result;
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = { message: responseText };
  }

  if (!response.ok) {
    console.error("SENDLIBERTY EMAIL FAILED:", {
      status: response.status,
      message: result.message || "Email provider rejected the request",
    });

    throw new Error(`Email delivery failed with status ${response.status}`);
  }

  console.log("Email provider accepted request:", response.status);
  return result;
};

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${getBackendUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  return sendEmail({
    to: email,
    subject: "Verify your SecureDrop account",
    html: `
      <h2>Welcome to SecureDrop</h2>
      <p>Please verify your email address to activate your account.</p>
      <p><a href="${verificationUrl}">Verify Email</a></p>
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
