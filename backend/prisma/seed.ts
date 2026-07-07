import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@dntech.id' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@dntech.id',
      passwordHash,
      name: 'Super Admin',
      role: 'SuperAdmin',
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      trustBadges: [
        { icon: 'shield', label: 'Bersertifikat ISO 27001', description: 'Manajemen Keamanan Informasi' },
        { icon: 'award', label: '1000+ Proyek', description: 'Berhasil diselesaikan' },
        { icon: 'check', label: '50Jt+ Pengguna', description: 'Di aplikasi klien kami' },
        { icon: 'zap', label: 'AWS Partner', description: 'Keahlian infrastruktur cloud' },
      ],
      clientLogos: [
        { name: 'Bank Sejahtera', initial: 'BS' },
        { name: 'PT Maju Bersama', initial: 'MB' },
        { name: 'CV Digital Nusantara', initial: 'DN' },
        { name: 'TechCorp Indonesia', initial: 'TC' },
        { name: 'Global Retail Co', initial: 'GR' },
        { name: 'FinServe Asia', initial: 'FA' },
      ],
      calendlyUrl: 'https://calendly.com/dntech/consultation',
      leadMagnetUrl: 'https://dntech.id/resources/enterprise-transformation-guide.pdf',
    },
    create: {
      id: 1,
      companyName: 'DN Tech',
      tagline: 'Solusi Teknologi Terpercaya untuk Bisnis Anda',
      companyEmail: 'hello@dntech.id',
      companyPhone: '+62 21 1234 5678',
      companyAddress: 'Jakarta, Indonesia',
      primaryColor: '#2563eb',
      socialLinks: {
        linkedin: 'https://linkedin.com/company/dntech',
        twitter: 'https://twitter.com/dntech',
        instagram: 'https://instagram.com/dntech',
        github: 'https://github.com/dntech',
      },
      seoTitleTemplate: '%s | DN Tech',
      seoDescriptionTemplate: 'DN Tech - Solusi teknologi enterprise untuk digitalisasi bisnis Anda.',
      aboutContent: {
        story: 'DN Tech didirikan dengan visi membantu perusahaan Indonesia bertransformasi digital. Sejak 2018, kami telah melayani lebih dari 100 klien di berbagai industri.',
        mission: 'Memberikan solusi teknologi inovatif yang mendorong pertumbuhan bisnis klien kami.',
        vision: 'Menjadi partner teknologi terpercaya #1 di Indonesia.',
        values: [
          { title: 'Inovasi', description: 'Selalu mencari solusi terbaik dan terkini' },
          { title: 'Integritas', description: 'Transparan dan jujur dalam setiap proyek' },
          { title: 'Kolaborasi', description: 'Bekerja sama dengan klien sebagai partner' },
          { title: 'Keunggulan', description: 'Kualitas terbaik dalam setiap hasil kerja' },
        ],
        achievements: [
          '100+ Proyek Selesai',
          '50+ Klien Enterprise',
          '15+ Industri Dilayani',
          'Bersertifikat ISO 27001',
        ],
      },
      termsContent: '<h1>Syarat & Ketentuan</h1><p>Dengan menggunakan layanan DN Tech, Anda menyetujui syarat dan ketentuan ini.</p>',
      privacyContent: '<h1>Kebijakan Privasi</h1><p>Kami menghormati privasi Anda dan melindungi data pribadi Anda.</p>',
      trustBadges: [
        { icon: 'shield', label: 'Bersertifikat ISO 27001', description: 'Manajemen Keamanan Informasi' },
        { icon: 'award', label: '1000+ Proyek', description: 'Berhasil diselesaikan' },
        { icon: 'check', label: '50Jt+ Pengguna', description: 'Di aplikasi klien kami' },
        { icon: 'zap', label: 'AWS Partner', description: 'Keahlian infrastruktur cloud' },
      ],
      clientLogos: [
        { name: 'Bank Sejahtera', initial: 'BS' },
        { name: 'PT Maju Bersama', initial: 'MB' },
        { name: 'CV Digital Nusantara', initial: 'DN' },
        { name: 'TechCorp Indonesia', initial: 'TC' },
        { name: 'Global Retail Co', initial: 'GR' },
        { name: 'FinServe Asia', initial: 'FA' },
      ],
      calendlyUrl: 'https://calendly.com/dntech/consultation',
      leadMagnetUrl: 'https://dntech.id/resources/enterprise-transformation-guide.pdf',
    },
  });

  const services = [
    {
      name: 'Pengembangan Perangkat Lunak Enterprise',
      slug: 'enterprise-software',
      description: 'Kami membangun sistem enterprise yang scalable, aman, dan terintegrasi dengan infrastruktur existing perusahaan Anda.',
      category: 'Perangkat Lunak Enterprise',
      seoTitle: 'Pengembangan Perangkat Lunak Enterprise Indonesia',
      seoDescription: 'Pengembangan ERP, CRM, dan sistem enterprise custom untuk perusahaan Indonesia. Scalable, aman, terintegrasi.',
      features: [
        { title: 'ERP/CRM Kustom', description: 'Sistem manajemen bisnis disesuaikan kebutuhan' },
        { title: 'Integrasi API', description: 'Integrasi dengan sistem legacy' },
        { title: 'Arsitektur Microservices', description: 'Arsitektur modern dan scalable' },
      ],
      status: 'active' as const,
      displayOrder: 1,
    },
    {
      name: 'Pengembangan Web & Mobile',
      slug: 'web-mobile-development',
      description: 'Pengembangan aplikasi web dan mobile dengan teknologi modern untuk meningkatkan engagement pelanggan.',
      category: 'Pengembangan Web',
      seoTitle: 'Jasa Pengembangan Web & Mobile Jakarta',
      seoDescription: 'Jasa pengembangan web app, mobile app, PWA, dan e-commerce untuk bisnis enterprise dan startup.',
      features: [
        { title: 'Progressive Web Apps', description: 'Aplikasi web dengan performa native' },
        { title: 'Aplikasi iOS & Android', description: 'Aplikasi mobile cross-platform' },
        { title: 'Solusi E-Commerce', description: 'Platform jual-beli online' },
      ],
      status: 'active' as const,
      displayOrder: 2,
    },
    {
      name: 'Cloud & DevOps',
      slug: 'cloud-devops',
      description: 'Migrasi cloud, infrastruktur as code, dan pipeline CI/CD untuk deployment yang reliable.',
      category: 'Layanan Cloud',
      seoTitle: 'Migrasi Cloud & Layanan DevOps',
      seoDescription: 'Migrasi AWS/Azure, Kubernetes, pipeline CI/CD, dan monitoring untuk infrastruktur enterprise.',
      features: [
        { title: 'Migrasi AWS/Azure', description: 'Migrasi cloud yang aman' },
        { title: 'Kubernetes & Docker', description: 'Orkestrasi container' },
        { title: 'Monitoring & Alerting', description: 'Stack observability lengkap' },
      ],
      status: 'active' as const,
      displayOrder: 3,
    },
    {
      name: 'Konsultasi & Strategi IT',
      slug: 'it-consulting',
      description: 'Konsultasi strategi digital transformation dan roadmap teknologi untuk bisnis Anda.',
      category: 'Konsultasi',
      seoTitle: 'Konsultasi IT & Transformasi Digital',
      seoDescription: 'Konsultasi transformasi digital, asesmen teknologi, dan audit keamanan untuk enterprise Indonesia.',
      features: [
        { title: 'Transformasi Digital', description: 'Roadmap transformasi digital' },
        { title: 'Asesmen Teknologi', description: 'Audit infrastruktur IT' },
        { title: 'Audit Keamanan', description: 'Penilaian keamanan sistem' },
      ],
      status: 'active' as const,
      displayOrder: 4,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: { ...service, createdById: admin.id },
    });
  }

  const portfolioItems = [
    {
      title: 'Sistem ERP Manufaktur',
      slug: 'erp-manufaktur',
      description: 'Implementasi ERP custom untuk perusahaan manufaktur dengan 500+ karyawan.',
      clientName: 'PT Maju Bersama',
      industries: ['Manufacturing'],
      challenge: 'Perusahaan manufaktur dengan 500+ karyawan masih menggunakan sistem legacy yang terpisah-pisah, menyebabkan inefficiency dan reporting yang lambat.',
      solution: 'DN Tech membangun ERP custom terintegrasi dengan modul produksi, inventory, HR, dan finance dalam satu platform cloud-native.',
      metrics: { efficiency: '+40%', reporting: '2 hours', uptime: '99.9%' },
      outcomes: 'Efisiensi operasional meningkat 40%, waktu reporting berkurang dari 3 hari menjadi 2 jam.',
      testimonial: 'DN Tech memberikan solusi yang tepat sasaran dan tim support yang responsif.',
      status: 'active' as const,
      displayOrder: 1,
    },
    {
      title: 'Platform E-Commerce B2B',
      slug: 'ecommerce-b2b',
      description: 'Platform e-commerce B2B dengan integrasi inventory dan payment gateway.',
      clientName: 'CV Digital Nusantara',
      industries: ['Retail', 'E-Commerce'],
      challenge: 'Klien retail B2B tidak memiliki platform online, kehilangan peluang penjualan ke distributor regional.',
      solution: 'Platform e-commerce B2B dengan katalog dinamis, integrasi inventory real-time, dan multi-payment gateway.',
      metrics: { sales: '+200%', orders: '10K/mo', conversion: '4.2%' },
      outcomes: 'Penjualan online meningkat 200% dalam 6 bulan pertama.',
      status: 'active' as const,
      displayOrder: 2,
    },
    {
      title: 'Mobile Banking App',
      slug: 'mobile-banking',
      description: 'Aplikasi mobile banking dengan fitur lengkap dan keamanan tinggi.',
      clientName: 'Bank Sejahtera',
      industries: ['Finance', 'Banking'],
      challenge: 'Bank regional perlu aplikasi mobile banking modern untuk bersaing dengan bank digital nasional.',
      solution: 'Aplikasi mobile banking native dengan biometric auth, QR payment, dan real-time notifications.',
      metrics: { downloads: '1M+', rating: '4.8★', transactions: '500K/day' },
      outcomes: '1 juta+ downloads, rating 4.8 di App Store.',
      status: 'active' as const,
      displayOrder: 3,
    },
  ];

  for (const item of portfolioItems) {
    await prisma.portfolioItem.upsert({
      where: { slug: item.slug },
      update: item,
      create: { ...item, createdById: admin.id },
    });
  }

  const teamMembers = [
    { name: 'Dozer', role: 'CEO & Founder', department: 'Leadership', bio: 'Visionary leader dengan 15+ tahun pengalaman di industri teknologi.', socialLinks: { linkedin: 'https://linkedin.com/in/dozer', twitter: 'https://twitter.com/dozer' }, displayOrder: 1 },
    { name: 'Sarah Wijaya', role: 'CTO', department: 'Engineering', bio: 'Expert in cloud architecture and enterprise systems.', socialLinks: { linkedin: 'https://linkedin.com/in/sarahwijaya', github: 'https://github.com/sarahw' }, displayOrder: 2 },
    { name: 'Budi Santoso', role: 'Head of Sales', department: 'Sales', bio: 'Membantu klien menemukan solusi teknologi yang tepat.', socialLinks: { linkedin: 'https://linkedin.com/in/budisantoso' }, displayOrder: 3 },
    { name: 'Maya Putri', role: 'Lead Designer', department: 'Design', bio: 'Passionate about creating intuitive user experiences.', socialLinks: { linkedin: 'https://linkedin.com/in/mayaputri', dribbble: 'https://dribbble.com/mayap' }, displayOrder: 4 },
  ];

  for (const member of teamMembers) {
    const existing = await prisma.teamMember.findFirst({ where: { name: member.name } });
    if (existing) {
      await prisma.teamMember.update({ where: { id: existing.id }, data: member });
    } else {
      await prisma.teamMember.create({ data: member });
    }
  }

  const testimonials = [
    { clientName: 'Ahmad Rizki', company: 'PT Maju Bersama', position: 'CEO', title: 'ERP Transformation Success', quote: 'DN Tech transformed our business operations completely. Highly recommended!', rating: 5, videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', isApproved: true },
    { clientName: 'Lisa Chen', company: 'CV Digital Nusantara', position: 'Director', title: 'E-Commerce Growth', quote: 'Professional team, on-time delivery, and excellent post-launch support.', rating: 5, isApproved: true },
    { clientName: 'Robert Tan', company: 'Bank Sejahtera', position: 'IT Director', title: 'Mobile Banking Excellence', quote: 'The mobile app exceeded our expectations in both features and security.', rating: 5, isApproved: true },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({ where: { clientName: t.clientName } });
    if (existing) {
      await prisma.testimonial.update({ where: { id: existing.id }, data: { ...t, createdById: admin.id } });
    } else {
      await prisma.testimonial.create({ data: { ...t, createdById: admin.id } });
    }
  }

  const blogPosts = [
    {
      title: '5 Tren Teknologi Enterprise 2026',
      slug: 'tren-teknologi-enterprise-2026',
      content: '<p>Industri teknologi enterprise terus berkembang pesat. Berikut 5 tren utama yang perlu diperhatikan perusahaan Anda di tahun 2026.</p><h2>1. AI-Powered Automation</h2><p>Artificial Intelligence semakin terintegrasi dalam proses bisnis, dari customer service hingga predictive maintenance.</p><h2>2. Edge Computing</h2><p>Processing data lebih dekat ke sumber untuk latency rendah dan real-time analytics.</p><h2>3. Zero Trust Security</h2><p>Model keamanan yang tidak lagi mengandalkan perimeter network tradisional.</p><p>Pelajari lebih lanjut tentang <a href="/services/enterprise-software">Enterprise Software Development</a> dan <a href="/case-studies/erp-manufaktur">case study ERP manufaktur</a> kami.</p>',
      excerpt: 'Pelajari tren teknologi enterprise terbaru yang akan membentuk bisnis di 2026.',
      category: 'Technology',
      tags: ['enterprise', 'trends', '2026', 'AI'],
      seoTitle: '5 Tren Teknologi Enterprise 2026 | DN Tech',
      seoDescription: 'Tren enterprise technology 2026: AI automation, edge computing, zero trust security, dan digital transformation strategies.',
      status: 'published' as const,
      publishedAt: new Date(),
      authorId: admin.id,
    },
    {
      title: 'Panduan Migrasi Cloud untuk UMKM',
      slug: 'panduan-migrasi-cloud-umkm',
      content: '<p>Migrasi ke cloud bukan lagi privilege perusahaan besar. UMKM juga bisa memanfaatkan cloud computing dengan biaya terjangkau.</p><h2>Mengapa Cloud?</h2><p>Biaya infrastruktur lebih rendah, scalability on-demand, dan keamanan data enterprise-grade.</p><h2>Langkah Migrasi</h2><p>Assessment → Pilot → Migration → Optimization. Download <a href="/resources">Cloud Migration Checklist</a> kami.</p><p>Butuh bantuan? Lihat layanan <a href="/services/cloud-devops">Cloud & DevOps</a> kami.</p>',
      excerpt: 'Step-by-step guide migrasi cloud yang affordable untuk UMKM Indonesia.',
      category: 'Cloud',
      tags: ['cloud', 'umkm', 'migration', 'AWS'],
      seoTitle: 'Panduan Migrasi Cloud untuk UMKM Indonesia',
      seoDescription: 'Guide lengkap migrasi cloud untuk UMKM: assessment, pilot project, migration strategy, dan cost optimization.',
      status: 'published' as const,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
    },
    {
      title: 'Best Practices Keamanan Aplikasi Web',
      slug: 'best-practices-keamanan-web',
      content: '<p>Keamanan aplikasi web adalah prioritas utama untuk enterprise. Berikut best practices yang wajib diterapkan.</p><h2>OWASP Top 10</h2><p>Pahami dan mitigasi 10 vulnerability paling kritis: injection, broken auth, XSS, dan lainnya.</p><h2>Secure SDLC</h2><p>Integrasikan security testing di setiap fase development.</p><p>DN Tech menerapkan OWASP standards di semua proyek <a href="/services/web-mobile-development">web development</a>. Lihat juga <a href="/case-studies/mobile-banking">case study mobile banking</a> kami.</p>',
      excerpt: 'Implementasi keamanan web application sesuai standar OWASP untuk enterprise.',
      category: 'Security',
      tags: ['security', 'web', 'owasp', 'devsecops'],
      seoTitle: 'Best Practices Keamanan Web Application (OWASP)',
      seoDescription: 'Panduan keamanan web app enterprise: OWASP Top 10, secure SDLC, penetration testing, dan compliance.',
      status: 'published' as const,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
    },
    {
      title: 'Cara Memilih Partner Software Development yang Tepat',
      slug: 'memilih-partner-software-development',
      content: '<p>Memilih vendor software development adalah keputusan strategis. Berikut kriteria evaluasi yang harus dipertimbangkan CTO dan IT Manager.</p><h2>Portfolio & Track Record</h2><p>Evaluasi proyek serupa di industri Anda. Minta referensi klien dan case study dengan metrics.</p><h2>Technical Capability</h2><p>Tim harus familiar dengan tech stack modern dan best practices enterprise.</p><p>Baca <a href="/case-studies">success stories</a> kami atau <a href="/contact">schedule consultation</a> gratis.</p>',
      excerpt: 'Panduan evaluasi vendor software development untuk decision makers enterprise.',
      category: 'Technology',
      tags: ['vendor selection', 'software development', 'enterprise'],
      seoTitle: 'Cara Memilih Partner Software Development Enterprise',
      seoDescription: 'Tips memilih vendor software development: portfolio review, technical assessment, SLA, dan pricing model.',
      status: 'published' as const,
      publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
    },
    {
      title: 'Digital Transformation Roadmap untuk Perusahaan Manufaktur',
      slug: 'digital-transformation-manufaktur',
      content: '<p>Industri manufaktur Indonesia menghadapi tekanan untuk bertransformasi digital. Berikut roadmap praktis 12 bulan.</p><h2>Fase 1: Assessment (Bulan 1-2)</h2><p>Audit sistem existing, identifikasi bottleneck, dan tentukan quick wins.</p><h2>Fase 2: ERP & Integration (Bulan 3-8)</h2><p>Implementasi ERP custom dengan integrasi mesin produksi dan inventory.</p><p>Lihat hasil implementasi kami di <a href="/case-studies/erp-manufaktur">case study ERP manufaktur</a> dengan efisiensi +40%.</p>',
      excerpt: 'Roadmap digital transformation 12 bulan untuk perusahaan manufaktur Indonesia.',
      category: 'Technology',
      tags: ['manufacturing', 'digital transformation', 'ERP'],
      seoTitle: 'Digital Transformation Roadmap Manufaktur Indonesia',
      seoDescription: 'Roadmap transformasi digital manufaktur: ERP implementation, IoT integration, dan operational efficiency.',
      status: 'published' as const,
      publishedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      authorId: admin.id,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  const faqs = [
    { question: 'Apa layanan yang ditawarkan DN Tech?', answer: 'Kami menawarkan pengembangan perangkat lunak enterprise, pengembangan web & mobile, cloud & DevOps, serta konsultasi IT.', category: 'Umum', displayOrder: 1 },
    { question: 'Berapa lama waktu pengembangan proyek?', answer: 'Tergantung kompleksitas. Proyek sederhana 2-3 bulan, enterprise project 6-12 bulan.', category: 'Services', displayOrder: 1 },
    { question: 'Apakah ada dukungan pasca-launch?', answer: 'Ya, kami menyediakan maintenance dan support package dengan SLA yang jelas.', category: 'Support', displayOrder: 1 },
    { question: 'Metode pembayaran proyek?', answer: 'Milestone-based payment: 30% upfront, 40% development, 30% delivery.', category: 'Pricing', displayOrder: 1 },
    { question: 'Apakah bisa remote collaboration?', answer: 'Tentu. Kami berpengalaman dengan distributed team dan remote project management.', category: 'General', displayOrder: 2 },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({ where: { question: faq.question } });
    if (!existing) await prisma.faq.create({ data: faq });
  }

  const careers = [
    {
      title: 'Senior Full Stack Developer',
      slug: 'senior-fullstack-developer',
      department: 'Engineering',
      location: 'Jakarta (Hybrid)',
      type: 'Full-time',
      description: 'Kami mencari Senior Full Stack Developer berpengalaman dengan React, Node.js, dan PostgreSQL.',
      requirements: '5+ tahun pengalaman, React/Next.js, Node.js, PostgreSQL, Git',
      status: 'active' as const,
    },
    {
      title: 'UI/UX Designer',
      slug: 'ui-ux-designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Designer kreatif untuk merancang interface aplikasi enterprise dan consumer.',
      requirements: '3+ tahun pengalaman, Figma, design systems, user research',
      status: 'active' as const,
    },
  ];

  for (const career of careers) {
    await prisma.career.upsert({
      where: { slug: career.slug },
      update: career,
      create: career,
    });
  }

  // Seed analytics events
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const views = Math.floor(Math.random() * 50) + 10;
    for (let j = 0; j < views; j++) {
      await prisma.analyticsEvent.create({
        data: {
          eventType: 'page_view',
          pageUrl: ['/', '/services', '/portfolio', '/blog', '/contact'][Math.floor(Math.random() * 5)],
          deviceType: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
          createdAt: date,
        },
      });
    }
  }

  console.log('Seed completed!');
  console.log(`Admin login: ${process.env.ADMIN_EMAIL || 'admin@dntech.id'} / ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
