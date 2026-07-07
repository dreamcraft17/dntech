import prisma from '../config/database';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@dntech.id';

export async function sendWelcomeEmail(to: string, name: string) {
  const subject = 'Thank you for contacting DN Tech';
  const html = `
    <h1>Hi ${name},</h1>
    <p>Thank you for reaching out to DN Tech. Our team will review your inquiry and get back to you within 1 business day.</p>
    <p>In the meantime, explore our <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/case-studies">case studies</a> to see how we help businesses transform digitally.</p>
    <p>Best regards,<br/>DN Tech Team</p>
  `;

  if (!SENDGRID_API_KEY) {
    console.log(`[Email] Welcome email to ${to} (SendGrid not configured)`);
    return;
  }

  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to, name }] }],
        from: { email: FROM_EMAIL, name: 'DN Tech' },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });
    if (!res.ok) console.error('[Email] SendGrid error:', await res.text());
  } catch (err) {
    console.error('[Email] Failed to send:', err);
  }
}

export async function sendNewsletterWelcome(to: string) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const html = `
    <h1>Welcome to DN Tech Insights!</h1>
    <p>Thanks for subscribing. You'll receive monthly updates on enterprise technology, case studies, and industry trends.</p>
    <p><a href="${frontendUrl}/resources">Download our free resources</a> to get started.</p>
    <p>Best regards,<br/>DN Tech Team</p>
  `;

  if (!SENDGRID_API_KEY) {
    console.log(`[Email] Newsletter welcome to ${to}`);
    return;
  }
  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: 'DN Tech' },
        subject: 'Welcome to DN Tech Newsletter',
        content: [{ type: 'text/html', value: html }],
      }),
    });
  } catch (err) {
    console.error('[Email] Newsletter failed:', err);
  }
}

export async function sendQuizFollowUp(to: string, name: string, service: string) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const html = `
    <h1>Hi ${name},</h1>
    <p>Based on your quiz answers, we recommend <strong>${service}</strong> for your needs.</p>
    <p><a href="${frontendUrl}/contact?service=${encodeURIComponent(service)}">Schedule a free consultation</a> with our team to discuss your project.</p>
    <p>Explore our <a href="${frontendUrl}/case-studies">case studies</a> to see similar success stories.</p>
    <p>Best regards,<br/>DN Tech Team</p>
  `;

  if (!SENDGRID_API_KEY) {
    console.log(`[Email] Quiz follow-up to ${to} → ${service}`);
    return;
  }

  try {
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to, name }] }],
        from: { email: FROM_EMAIL, name: 'DN Tech' },
        subject: `Your recommended solution: ${service}`,
        content: [{ type: 'text/html', value: html }],
      }),
    });
  } catch (err) {
    console.error('[Email] Quiz follow-up failed:', err);
  }
}
