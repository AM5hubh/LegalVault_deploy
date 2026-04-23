const nodemailer = require('../config/nodemailer');

// Send email notification (e.g., password reset, KYC status)
async function sendEmail(to, subject, htmlContent) {
  try {
    await nodemailer.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

// Send password reset email
async function sendPasswordResetEmail(to, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const htmlContent = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
  `;
  return await sendEmail(to, 'Password Reset Request', htmlContent);
}

// Send KYC status notification
async function sendKycStatusEmail(to, status, message) {
  const htmlContent = `
    <h1>KYC Verification Update</h1>
    <p>Your KYC verification status: <strong>${status}</strong></p>
    <p>${message}</p>
  `;
  return await sendEmail(to, 'KYC Verification Status', htmlContent);
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendKycStatusEmail,
};

