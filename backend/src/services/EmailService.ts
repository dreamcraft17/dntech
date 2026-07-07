import prisma from '../config/database';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@dntech.id';

export async function sendWelcomeEmail(to: string, name: string) {
  const subject = 'Terima kasih telah menghubungi DN Tech';
  const html = `
    <h1>Halo ${name},</h1>
    <p>Terima kasih telah menghubungi DN Tech. Tim kami akan meninjau inquiry Anda dan merespons dalam 1 hari kerja.</p>
    <p>Sementara itu, jelajahi <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/case-studies">studi kasus kami</a> untuk melihat bagaimana kami membantu bisnis bertransformasi digital.</p>
    <p>Salam,<br/>Tim DN Tech</p>
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
    <h1>Selamat datang di DN Tech Insights!</h1>
    <p>Terima kasih telah berlangganan. Anda akan menerima update bulanan tentang teknologi enterprise, studi kasus, dan tren industri.</p>
    <p><a href="${frontendUrl}/resources">Unduh sumber daya gratis kami</a> untuk memulai.</p>
    <p>Salam,<br/>Tim DN Tech</p>
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
        subject: 'Selamat datang di Newsletter DN Tech',
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
    <h1>Halo ${name},</h1>
    <p>Berdasarkan jawaban kuis Anda, kami merekomendasikan <strong>${service}</strong> untuk kebutuhan Anda.</p>
    <p><a href="${frontendUrl}/contact?service=${encodeURIComponent(service)}">Jadwalkan konsultasi gratis</a> dengan tim kami untuk mendiskusikan proyek Anda.</p>
    <p>Jelajahi <a href="${frontendUrl}/case-studies">studi kasus kami</a> untuk melihat kisah sukses serupa.</p>
    <p>Salam,<br/>Tim DN Tech</p>
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
        subject: `Rekomendasi solusi untuk Anda: ${service}`,
        content: [{ type: 'text/html', value: html }],
      }),
    });
  } catch (err) {
    console.error('[Email] Quiz follow-up failed:', err);
  }
}
