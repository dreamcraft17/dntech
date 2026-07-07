import prisma from '../config/database';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@dntech.id';
const SALES_EMAIL = process.env.SALES_EMAIL || 'sales@dntech.id';

function frontendBase() {
  return (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')[0].trim();
}

async function sendEmail(to: string, subject: string, html: string, name?: string) {
  if (!SENDGRID_API_KEY) {
    console.log(`[Email] ${subject} → ${to}`);
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

export async function sendWelcomeEmail(to: string, name: string) {
  const base = frontendBase();
  const html = `
    <h1>Halo ${name},</h1>
    <p>Terima kasih telah menghubungi DN Tech. Tim kami akan meninjau inquiry Anda dan merespons dalam <strong>24 jam kerja</strong>.</p>
    <p>Sementara itu, baca <a href="${base}/blog">artikel terbaru kami</a> tentang tech stack dan pengembangan startup.</p>
    <p>Salam,<br/>Tim DN Tech</p>
  `;
  await sendEmail(to, 'Terima kasih telah menghubungi DN Tech', html, name);
}

export async function sendLeadNotification(lead: {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  projectType?: string;
  serviceType?: string;
  budgetRange?: string;
  timeline?: string;
  message?: string;
  source?: string;
}) {
  const html = `
    <h2>Lead Baru dari Website</h2>
    <ul>
      <li><strong>Nama:</strong> ${lead.name}</li>
      <li><strong>Email:</strong> ${lead.email}</li>
      ${lead.phone ? `<li><strong>Telepon:</strong> ${lead.phone}</li>` : ''}
      ${lead.companyName ? `<li><strong>Perusahaan:</strong> ${lead.companyName}</li>` : ''}
      ${lead.projectType ? `<li><strong>Jenis proyek:</strong> ${lead.projectType}</li>` : ''}
      ${lead.serviceType ? `<li><strong>Layanan:</strong> ${lead.serviceType}</li>` : ''}
      ${lead.budgetRange ? `<li><strong>Anggaran:</strong> ${lead.budgetRange}</li>` : ''}
      ${lead.timeline ? `<li><strong>Timeline:</strong> ${lead.timeline}</li>` : ''}
      ${lead.message ? `<li><strong>Deskripsi:</strong> ${lead.message}</li>` : ''}
      ${lead.source ? `<li><strong>Sumber:</strong> ${lead.source}</li>` : ''}
    </ul>
  `;
  await sendEmail(SALES_EMAIL, `Lead baru: ${lead.name}`, html);
}

export async function sendNewsletterWelcome(to: string) {
  const base = frontendBase();
  const html = `
    <h1>Selamat datang di DN Tech Insights!</h1>
    <p>Terima kasih telah berlangganan. Anda akan menerima update tentang teknologi, startup, dan best practices development.</p>
    <p><a href="${base}/blog">Baca artikel terbaru kami</a>.</p>
    <p>Salam,<br/>Tim DN Tech</p>
  `;
  await sendEmail(to, 'Selamat datang di Newsletter DN Tech', html);
}

export async function sendQuizFollowUp(to: string, name: string, service: string) {
  const base = frontendBase();
  const html = `
    <h1>Halo ${name},</h1>
    <p>Berdasarkan jawaban kuis Anda, kami merekomendasikan <strong>${service}</strong> untuk kebutuhan Anda.</p>
    <p><a href="${base}/contact?service=${encodeURIComponent(service)}">Jadwalkan konsultasi gratis</a> dengan tim kami.</p>
    <p>Baca juga <a href="${base}/blog">artikel blog kami</a> untuk insight teknologi startup.</p>
    <p>Salam,<br/>Tim DN Tech</p>
  `;
  await sendEmail(to, `Rekomendasi solusi untuk Anda: ${service}`, html, name);
}
