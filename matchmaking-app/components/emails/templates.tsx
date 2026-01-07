import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface EmailTemplateProps {
  firstName: string;
  verificationLink: string;
}

export const VerificationEmailTemplate = ({
  firstName,
  verificationLink,
}: EmailTemplateProps) => (
  <Html>
    <Head />
    <Preview>Verify your email to get started with MatchMaking App</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to MatchMaking App! 💕</Heading>
        <Text style={text}>Hi {firstName},</Text>
        <Text style={text}>
          Thank you for signing up! We're excited to have you join our community.
          Please verify your email address to get started and find your perfect match.
        </Text>
        <Section style={buttonContainer}>
          <Button style={button} href={verificationLink}>
            Verify Email Address
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          This link will expire in 24 hours.
        </Text>
        <Text style={footer}>
          Or copy and paste this link: <Link href={verificationLink}>{verificationLink}</Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

interface PasswordResetEmailProps {
  firstName: string;
  resetLink: string;
}

export const PasswordResetEmailTemplate = ({
  firstName,
  resetLink,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your MatchMaking App password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset Your Password 🔐</Heading>
        <Text style={text}>Hi {firstName},</Text>
        <Text style={text}>
          We received a request to reset your password for your MatchMaking App account.
          Click the button below to create a new password.
        </Text>
        <Section style={buttonContainer}>
          <Button style={buttonRed} href={resetLink}>
            Reset Password
          </Button>
        </Section>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this email.
          Your password will remain unchanged.
        </Text>
        <Text style={footer}>
          This link will expire in 1 hour for security reasons.
        </Text>
        <Text style={footer}>
          Or copy and paste this link: <Link href={resetLink}>{resetLink}</Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 20px',
};

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '12px 24px',
};

const buttonRed = {
  ...button,
  backgroundColor: '#dc3545',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 20px',
};
