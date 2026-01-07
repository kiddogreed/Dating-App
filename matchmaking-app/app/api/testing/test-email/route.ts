import { NextResponse } from 'next/server';
import { resend, isEmailConfigured } from '@/lib/resend';
import { VerificationEmailTemplate, PasswordResetEmailTemplate } from '@/components/emails/templates';

export async function GET() {
  try {
    // Check if email is configured
    if (!isEmailConfigured) {
      return NextResponse.json({
        success: false,
        message: 'Email service not configured. Add RESEND_API_KEY to your .env file.',
        isConfigured: false,
      });
    }

    // Test verification email
    const testVerificationEmail = await resend!.emails.send({
      from: 'MatchMaking App <onboarding@resend.dev>',
      to: 'delivered@resend.dev', // Resend's test email
      subject: 'Test: Email Verification',
      react: VerificationEmailTemplate({
        firstName: 'John',
        verificationLink: 'http://localhost:3000/auth/verify-email?token=test123',
      }),
    });

    // Test password reset email
    const testResetEmail = await resend!.emails.send({
      from: 'MatchMaking App <onboarding@resend.dev>',
      to: 'delivered@resend.dev',
      subject: 'Test: Password Reset',
      react: PasswordResetEmailTemplate({
        firstName: 'Jane',
        resetLink: 'http://localhost:3000/auth/reset-password?token=test456',
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Test emails sent successfully!',
      isConfigured: true,
      results: {
        verification: testVerificationEmail,
        passwordReset: testResetEmail,
      },
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test emails',
      isConfigured: isEmailConfigured,
    }, { status: 500 });
  }
}
