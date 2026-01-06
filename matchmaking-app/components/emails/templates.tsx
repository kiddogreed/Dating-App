import * as React from 'react';

interface EmailTemplateProps {
  firstName: string;
  verificationLink: string;
}

export const VerificationEmailTemplate = ({
  firstName,
  verificationLink,
}: EmailTemplateProps) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <h2 style={{ color: '#333' }}>Welcome to MatchMaking App!</h2>
    <p>Hi {firstName},</p>
    <p>Thank you for signing up! Please verify your email address to get started.</p>
    <div style={{ margin: '30px 0' }}>
      <a
        href={verificationLink}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block',
        }}
      >
        Verify Email Address
      </a>
    </div>
    <p style={{ color: '#666', fontSize: '14px' }}>
      If you didn't create an account, you can safely ignore this email.
    </p>
    <p style={{ color: '#666', fontSize: '14px' }}>
      This link will expire in 24 hours.
    </p>
  </div>
);

interface PasswordResetEmailProps {
  firstName: string;
  resetLink: string;
}

export const PasswordResetEmailTemplate = ({
  firstName,
  resetLink,
}: PasswordResetEmailProps) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <h2 style={{ color: '#333' }}>Reset Your Password</h2>
    <p>Hi {firstName},</p>
    <p>We received a request to reset your password. Click the button below to create a new password.</p>
    <div style={{ margin: '30px 0' }}>
      <a
        href={resetLink}
        style={{
          backgroundColor: '#dc3545',
          color: 'white',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '4px',
          display: 'inline-block',
        }}
      >
        Reset Password
      </a>
    </div>
    <p style={{ color: '#666', fontSize: '14px' }}>
      If you didn't request a password reset, you can safely ignore this email.
    </p>
    <p style={{ color: '#666', fontSize: '14px' }}>
      This link will expire in 1 hour.
    </p>
  </div>
);
