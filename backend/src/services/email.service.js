import transporter from "../config/mail.js";

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `http://localhost:8000/api/auth/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your SecureDrop account",

    html: `
      <h2>Welcome to SecureDrop</h2>

      <p>Please verify your email address.</p>

      <a href="${verificationUrl}">
        Verify Email
      </a>

      <p>This link will expire soon.</p>
    `,
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `http://localhost:8000/api/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset your SecureDrop password",
    html: `
      <h2>Password Reset</h2>
      <p>We received a request to reset your password.</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
  });
};
