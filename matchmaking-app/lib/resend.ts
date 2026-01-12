import { Resend } from 'resend';
import { render } from '@react-email/render';
import { VerificationEmailTemplate, PasswordResetEmailTemplate } from '@/components/emails/templates';

// Make Resend optional - if no API key, emails won't be sent
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const isEmailConfigured = !!process.env.RESEND_API_KEY;

// Helper function to render React Email components to HTML
export const renderEmail = (component: React.ReactElement) => {
  return render(component, {
    pretty: true,
  });
};

// Send verification email
export async function sendVerificationEmail(
  email: string,
  firstName: string,
  verificationLink: string
): Promise<boolean> {
  if (!resend) {
    console.warn('Email service not configured. Skipping email send.');
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Matchmaking App <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your Email - Matchmaking App',
      react: VerificationEmailTemplate({
        firstName,
        verificationLink,
      }),
    });

    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetLink: string
): Promise<boolean> {
  if (!resend) {
    console.warn('Email service not configured. Skipping email send.');
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Matchmaking App <onboarding@resend.dev>',
      to: email,
      subject: 'Reset Your Password - Matchmaking App',
      react: PasswordResetEmailTemplate({
        firstName,
        resetLink,
      }),
    });

    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}
