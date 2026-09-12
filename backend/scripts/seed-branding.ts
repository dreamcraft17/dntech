import prisma from '../src/config/database';

const MISSION =
  'Kami membangun software yang memberdayakan bisnis Indonesia — HRIS, ERP, dan tools operasional — dengan harga transparan untuk startup dan UMKM.';

const STORY = `DN Tech adalah studio produk digital Indonesia. Kami membangun dan mengoperasikan platform first-party seperti dnPeople (HRIS), dnCore (ERP), dan dnShop Finance.

Didirikan oleh Dozer Napitupulu, fokus kami bukan angka klien di slide deck — melainkan produk yang bisa dicoba, di-deploy, dan dipertanggungjawabkan. Beberapa produk masih beta atau soft launch; yang sudah live ditandai jelas di halaman Produk.

Butuh custom development atau integrasi? Hubungi kami — setiap proyek dimulai dari conversation, bukan template pitch deck.`;

const VISION =
  'Produk first-party yang bisa dicoba publik, plus custom development dengan harga dan timeline yang ditulis di depan.';

const FOUNDER = {
  name: 'Dozer Napitupulu',
  role: 'Founder & Tech Lead',
  bio: `Dozer mendirikan DN Tech supaya klien kerja langsung dengan orang yang nulis kodenya — bukan lewat lapisan account manager. Lima belas tahun lebih develop software: HRIS, ERP, tools operasional. Di project penting dia masih masuk ke arsitektur, review, dan keputusan yang tidak bisa dilimpahkan.

PT. Dozer Napitupulu Technology adalah badan hukum di belakang studio ini. Produk first-party kami jadi bukti teknis — yang sudah live ditandai jelas, yang masih beta tidak dikamuflase jadi case study.`,
};

async function seedBranding() {
  await prisma.brandContent.deleteMany();
  await prisma.coreValue.deleteMany();
  await prisma.competitiveAdvantage.deleteMany();
  await prisma.stat.deleteMany();

  await prisma.brandContent.create({
    data: {
      tagline: 'Tentang DN Tech',
      mission: MISSION,
      story: STORY,
    },
  });

  // /about reads SiteSettings.aboutContent, not BrandContent — keep both in sync.
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      aboutContent: { story: STORY, mission: MISSION, vision: VISION, founder: FOUNDER },
    },
    create: {
      id: 1,
      companyName: 'DN Tech',
      aboutContent: { story: STORY, mission: MISSION, vision: VISION, founder: FOUNDER },
    },
  });

  const values = [
    { name: 'Pragmatik', description: 'Solusi yang kerja, bukan fancy tapi useless', iconName: 'Wrench' },
    { name: 'Jujur', description: 'Pricing transparan, timeline realistis, status produk jelas', iconName: 'Handshake' },
    { name: 'Fokus Produk', description: 'Platform internal kami adalah bukti teknis, bukan logo klien fiktif', iconName: 'Target' },
    { name: 'Kualitas dulu', description: 'Code bersih, tested, documented', iconName: 'CheckCircle' },
    { name: 'Pola pikir tumbuh', description: 'Terus belajar dan improve', iconName: 'TrendingUp' },
  ];

  await Promise.all(values.map((value, index) => prisma.coreValue.create({
    data: { ...value, order: index },
  })));

  const advantages = [
    { title: 'Lokal dan ahli', description: 'Tim Indonesia paham bisnis lokal', iconName: 'MapPin' },
    { title: 'Transparan', description: 'Harga tetap, timeline jelas, tanpa biaya tersembunyi', iconName: 'ShieldCheck' },
    { title: 'Langsung ke founder', description: 'Founder terlibat di setiap project', iconName: 'Users' },
    { title: 'Dukungan jangka panjang', description: 'Maintenance dan training termasuk', iconName: 'LifeBuoy' },
  ];

  await Promise.all(advantages.map((item, index) => prisma.competitiveAdvantage.create({
    data: { ...item, order: index },
  })));

  const stats = [
    { label: 'Produk First-Party', value: 7, iconName: 'Package', order: 0 },
    { label: 'Tahun Membangun', value: 3, iconName: 'Calendar', order: 1 },
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
