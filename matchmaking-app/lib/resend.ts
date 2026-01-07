import { Resend } from 'resend';
import { render } from '@react-email/render';

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
