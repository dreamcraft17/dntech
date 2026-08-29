import prisma from '../src/config/database';

async function seedBranding() {
  await prisma.brandContent.deleteMany();
  await prisma.coreValue.deleteMany();
  await prisma.competitiveAdvantage.deleteMany();
  await prisma.stat.deleteMany();

  await prisma.brandContent.create({
    data: {
      tagline: 'Tentang DN Tech',
      mission: 'Kami membangun software yang memberdayakan bisnis Indonesia — HRIS, ERP, dan tools operasional — dengan harga transparan untuk startup dan UMKM.',
      story: `DN Tech adalah studio produk digital Indonesia. Kami membangun dan mengoperasikan platform first-party seperti dnPeople (HRIS), dnCore (ERP), dan dnShop Finance.

Didirikan oleh Dozer Napitupulu, fokus kami bukan angka klien di slide deck — melainkan produk yang bisa dicoba, di-deploy, dan dipertanggungjawabkan. Beberapa produk masih beta atau soft launch; yang sudah live ditandai jelas di halaman Produk.

Butuh custom development atau integrasi? Hubungi kami — setiap proyek dimulai dari conversation, bukan template pitch deck.`,
    },
  });

  const values = [
    { name: 'Pragmatik', description: 'Solusi yang kerja, bukan fancy tapi useless', iconName: 'Wrench' },
    { name: 'Jujur', description: 'Pricing transparan, timeline realistis, status produk jelas', iconName: 'Handshake' },
    { name: 'Fokus Produk', description: 'Platform internal kami adalah bukti teknis, bukan logo klien fiktif', iconName: 'Target' },
    { name: 'Quality First', description: 'Code bersih, tested, documented', iconName: 'CheckCircle' },
    { name: 'Growth Mindset', description: 'Terus belajar dan improve', iconName: 'TrendingUp' },
  ];

  await Promise.all(values.map((value, index) => prisma.coreValue.create({
    data: { ...value, order: index },
  })));

  const advantages = [
    { title: 'Local + expert', description: 'Tim Indonesia paham bisnis lokal', iconName: 'MapPin' },
    { title: 'Transparent', description: 'Fixed price, jelas timeline, no hidden fees', iconName: 'ShieldCheck' },
    { title: 'Hands-on', description: 'Founder involved di setiap project', iconName: 'Users' },
    { title: 'Long-term support', description: 'Maintenance + training included', iconName: 'LifeBuoy' },
  ];

  await Promise.all(advantages.map((item, index) => prisma.competitiveAdvantage.create({
    data: { ...item, order: index },
  })));

  const stats = [
    { label: 'Produk First-Party', value: 6, iconName: 'Package', order: 0 },
    { label: 'Produk Live / Beta', value: 4, iconName: 'Rocket', order: 1 },
    { label: 'Tahun Membangun', value: 3, iconName: 'Calendar', order: 2 },
    { label: 'Automated Tests', value: 81, iconName: 'CheckCircle', order: 3 },
  ];

  await Promise.all(stats.map((item) => prisma.stat.create({ data: item })));
  console.log('Branding seed complete');
}

seedBranding()
  .catch((err) => {
    console.error('Branding seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
