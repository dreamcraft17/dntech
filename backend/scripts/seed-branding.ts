import prisma from '../src/config/database';

async function seedBranding() {
  await prisma.brandContent.deleteMany();
  await prisma.coreValue.deleteMany();
  await prisma.competitiveAdvantage.deleteMany();
  await prisma.stat.deleteMany();

  await prisma.brandContent.create({
    data: {
      tagline: 'Tentang DN Tech',
      mission: 'Kami membangun software yang memberdayakan bisnis Indonesia untuk berkembang dan berinovasi.',
      story: `DN Tech adalah software house Indonesia yang fokus pada solusi custom untuk startup dan perusahaan menengah.

Didirikan oleh Dozer Napitupulu, kami memulai dengan visi sederhana: membuat teknologi yang accessible tapi profesional untuk bisnis lokal.

Kami percaya bahwa teknologi seharusnya mempermudah, bukan memperumit. Setiap project adalah partnership, bukan transaksi.

Sampai hari ini, kami sudah bantu 50+ perusahaan Indonesia transform business mereka dengan software yang tepat.`,
    },
  });

  const values = [
    { name: 'Pragmatik', description: 'Solusi yang kerja, bukan fancy tapi useless', iconName: 'Wrench' },
    { name: 'Jujur', description: 'Transparent pricing, realistic timelines', iconName: 'Handshake' },
    { name: 'Fokus Klien', description: 'Success klien = success kami', iconName: 'Target' },
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
    { label: 'Proyek Selesai', value: 50, iconName: 'CheckCircle', order: 0 },
    { label: 'Klien Puas', value: 30, iconName: 'Smile', order: 1 },
    { label: 'Tahun di Industri', value: 5, iconName: 'Calendar', order: 2 },
    { label: 'On-time Delivery', value: 100, iconName: 'Zap', order: 3 },
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
