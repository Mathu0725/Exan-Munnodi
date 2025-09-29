const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const emailService = {
  async sendPasswordResetEmail(email, token, otp) {
    const resetUrl = `${API_BASE_URL}/reset-password?token=${token}`;
    const subject = 'Password Reset - Exam Munnodi';
    const otpLine = otp ? `Your one-time code: ${otp}\n\n` : '';
    const text = `You requested a password reset. ${otp ? 'Use the OTP below or the link to reset your password.' : 'Click the link below to reset your password.'}\n\n${otpLine}${resetUrl}\n\nThis ${otp ? 'code/link' : 'link'} will expire in 30 minutes. If you didn't request this, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your UnicomTIC Quiz account.</p>
        ${otp ? `<p style="font-size:16px;"><strong>One-time code (OTP):</strong> <span style="font-family:monospace; font-size:18px; letter-spacing:2px;">${otp}</span></p>` : ''}
        <div style="margin:16px 0; display:flex; gap:12px;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset via Link</a>
          <a href="${API_BASE_URL}/reset-with-otp" style="background-color: #10b981; color: white; padding: 12px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">Enter OTP Manually</a>
        </div>
        <p style="color:#555;">This ${otp ? 'code/link' : 'link'} will expire in 30 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail({ to: [email], subject, text, html });
  },

  async sendUserApprovalEmail(email, name, status, approverName) {
    const subjectMap = {
      Approved: 'Account Approved - Exam Munnodi',
      Rejected: 'Account Update - Exam Munnodi',
      Suspended: 'Account Update - Exam Munnodi',
    };

    const messageMap = {
      Approved: `Your account has been approved by ${approverName}. You can now log in and access the platform.`,
      Rejected: `Your account registration has been reviewed and rejected by ${approverName}. Please contact support for more information.`,
      Suspended: `Your account has been suspended by ${approverName}. Please contact support for more information.`,
    };

    const subject = subjectMap[status] || 'Account Update - Exam Munnodi';
    const message =
      messageMap[status] ||
      `Your account status has been updated to ${status} by ${approverName}.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Account Status Update</h2>
        <p>Dear ${name},</p>
        <p>${message}</p>
        <p>If you have any questions, please contact support.</p>
      </div>
    `;

    return this.sendEmail({ to: [email], subject, text: message, html });
  },

  async sendProfileUpdateResultEmail(
    email,
    name,
    status,
    reviewerName,
    comment = ''
  ) {
    const subject = 'Profile Update Result - Exam Munnodi';
    const message = `Your profile update request has been ${status.toLowerCase()} by ${reviewerName}. ${comment || ''}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Profile Update Result</h2>
        <p>Dear ${name},</p>
        <p>Your profile update request has been <strong>${status.toLowerCase()}</strong> by ${reviewerName}.</p>
        ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
        <p>If you have any questions, please contact support.</p>
      </div>
    `;

    return this.sendEmail({ to: [email], subject, text: message, html });
  },

  async sendEmail({ to, subject, text, html }) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, text, html }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Email send failed');
      }

      return res.json();
    } catch (error) {
      console.warn(
        '[emailService] Falling back to console log:',
        error.message
      );
      console.log(
        '[emailService] To:',
        to,
        '\nSubject:',
        subject,
        '\nMessage:',
        text
      );
      return { success: false, fallback: true };
    }
  },
};
