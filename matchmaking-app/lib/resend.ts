import { Resend } from 'resend';

// Make Resend optional - if no API key, emails won't be sent
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const isEmailConfigured = !!process.env.RESEND_API_KEY;
