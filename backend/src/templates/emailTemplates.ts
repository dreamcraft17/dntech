function escapeHtml(value?: string | null) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function shell(title: string, body: string) {
  return `
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;background:#f3f4f6;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;line-height:1.6;">
        <div style="max-width:640px;margin:0 auto;padding:24px;">
          <div style="background:#1e3a8a;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;font-size:22px;">${title}</h1>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 8px 8px;">
            ${body}
            <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="margin:0;font-size:13px;color:#6b7280;">
              DN Tech - PT. Dozer Napitupulu Technology<br />
              <a href="mailto:info@dntech.id" style="color:#1e3a8a;">info@dntech.id</a> ·
              <a href="https://dntech.id" style="color:#1e3a8a;">dntech.id</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export const emailTemplates = {
  formConfirmation(userName: string, projectType?: string) {
    return {
      subject: 'Terima kasih telah menghubungi DN Tech',
      html: shell('Terima Kasih!', `
        <p>Halo <strong>${escapeHtml(userName)}</strong>,</p>
        <p>Terima kasih telah menghubungi DN Tech${projectType ? ` untuk kebutuhan <strong>${escapeHtml(projectType)}</strong>` : ''}.</p>
        <p>Tim kami akan meninjau detail Anda dan merespons dalam waktu <strong>24 jam kerja</strong>.</p>
        <ul>
          <li>Kami meninjau kebutuhan proyek Anda.</li>
          <li>Tim DN Tech akan menghubungi Anda untuk diskusi lanjutan.</li>
          <li>Kami menyiapkan rekomendasi atau proposal sesuai kebutuhan.</li>
        </ul>
      `),
    };
  },

  adminLeadNotification(lead: {
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
    const project = lead.serviceType || lead.projectType || 'Umum';
    return {
      subject: `Lead Baru: ${lead.name} - ${project}`,
      html: shell('Lead Baru dari Website', `
        <p>Lead baru diterima. Segera follow up agar peluang tidak dingin.</p>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          ${[
            ['Nama', lead.name],
            ['Email', `<a href="mailto:${escapeHtml(lead.email)}" style="color:#1e3a8a;">${escapeHtml(lead.email)}</a>`],
            ['Telepon', lead.phone || '-'],
            ['Perusahaan', lead.companyName || '-'],
            ['Jenis Proyek', project],
            ['Anggaran', lead.budgetRange || '-'],
            ['Timeline', lead.timeline || '-'],
            ['Sumber', lead.source || '-'],
            ['Pesan', lead.message || '-'],
          ].map(([key, val]) => `
            <tr>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:150px;">${key}</td>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${val}</td>
            </tr>
          `).join('')}
        </table>
        <p><a href="https://dntech.id/admin/leads" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;">Buka Admin Leads</a></p>
      `),
    };
  },

  newsletterConfirmation(confirmLink: string) {
    return {
      subject: 'Konfirmasi Langganan Newsletter DN Tech',
      html: shell('Konfirmasi Newsletter', `
        <p>Terima kasih telah berlangganan newsletter DN Tech.</p>
        <p>Klik tombol di bawah untuk mengonfirmasi email Anda.</p>
        <p><a href="${confirmLink}" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:600;">Konfirmasi Email</a></p>
        <p style="font-size:13px;color:#6b7280;word-break:break-all;">Jika tombol tidak bekerja, buka link ini: ${confirmLink}</p>
      `),
    };
  },

  newsletterWelcome(unsubscribeLink?: string) {
    return {
      subject: 'Selamat datang di Newsletter DN Tech',
      html: shell('Selamat Datang!', `
        <p>Anda sudah berhasil bergabung dengan newsletter DN Tech.</p>
        <p>Anda akan menerima insight teknologi, tips pengembangan software, dan update dari DN Tech.</p>
        <p><a href="https://dntech.id/blog" style="color:#1e3a8a;">Baca artikel terbaru</a></p>
        ${unsubscribeLink ? `<p style="font-size:12px;color:#6b7280;"><a href="${unsubscribeLink}" style="color:#6b7280;">Unsubscribe</a></p>` : ''}
      `),
    };
  },

  careerApplicationNotification(application: {
    name: string;
    email: string;
    phone?: string;
    position: string;
    message: string;
    resumeUrl?: string;
  }) {
    return {
      subject: `Aplikasi Karier Baru: ${application.position} - ${application.name}`,
      html: shell('Aplikasi Karier Baru', `
        <p>Aplikasi baru diterima dari website DN Tech.</p>
        <ul>
          <li><strong>Posisi:</strong> ${escapeHtml(application.position)}</li>
          <li><strong>Nama:</strong> ${escapeHtml(application.name)}</li>
          <li><strong>Email:</strong> <a href="mailto:${escapeHtml(application.email)}" style="color:#1e3a8a;">${escapeHtml(application.email)}</a></li>
          <li><strong>Telepon:</strong> ${escapeHtml(application.phone || '-')}</li>
          <li><strong>CV:</strong> ${application.resumeUrl ? `<a href="${escapeHtml(application.resumeUrl)}" style="color:#1e3a8a;">Download CV</a>` : '-'}</li>
        </ul>
        <p><strong>Pesan:</strong></p>
        <p>${escapeHtml(application.message)}</p>
      `),
    };
  },

  careerApplicationConfirmation(userName: string, position: string) {
    return {
      subject: 'Terima kasih atas lamaran Anda ke DN Tech',
      html: shell('Lamaran Diterima', `
        <p>Halo <strong>${escapeHtml(userName)}</strong>,</p>
        <p>Terima kasih telah melamar posisi <strong>${escapeHtml(position)}</strong> di DN Tech.</p>
        <p>Tim kami akan meninjau lamaran Anda dan menghubungi Anda jika ada kecocokan.</p>
      `),
    };
  },

  quizRecommendations(userName: string, service: string) {
    return {
      subject: `Rekomendasi solusi untuk Anda: ${service}`,
      html: shell('Hasil Quiz Anda', `
        <p>Halo <strong>${escapeHtml(userName)}</strong>,</p>
        <p>Berdasarkan jawaban quiz Anda, kami merekomendasikan <strong>${escapeHtml(service)}</strong>.</p>
        <p><a href="https://dntech.id/contact?service=${encodeURIComponent(service)}" style="display:inline-block;background:#1e3a8a;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;">Diskusi Gratis</a></p>
      `),
    };
  },
};
