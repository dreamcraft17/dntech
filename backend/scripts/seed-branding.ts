import prisma from '../src/config/database';

const MISSION =
  'Kami membantu bisnis Indonesia membangun dan menghubungkan software untuk workflow penting — dari MVP, HRIS, ERP, hingga tools operasional — dengan scope, timeline, dan harga yang jelas.';

const STORY = `DN Tech adalah studio produk digital Indonesia yang membangun software berdasarkan workflow yang benar-benar perlu berjalan. Kami mengembangkan dan mengoperasikan produk first-party seperti dnPeople (HRIS), dnCore (ERP), dan dnShop Finance.

Didirikan oleh Dozer Napitupulu, fokus kami bukan daftar kemampuan yang panjang — melainkan produk dan sistem yang bisa dicoba, di-deploy, dan dipertanggungjawabkan. Beberapa produk masih beta atau soft launch; statusnya ditandai jelas di halaman Produk.

Butuh MVP, custom development, atau integrasi? Hubungi kami — setiap proyek dimulai dari memahami workflow dan scope, bukan template pitch deck.`;

const VISION =
  'Membuat software yang bisa dipahami, dicoba, dan dipakai bisnis Indonesia — dengan custom development yang scope, harga, dan timeline-nya ditulis di depan.';

const FOUNDER = {
  name: 'Dozer Napitupulu',
  role: 'Founder & Tech Lead',
  bio: `Dozer Napitupulu mendirikan DN Tech agar klien dapat bekerja langsung dengan penulis kodenya, bukan melalui perantara account manager. Beliau mengembangkan aplikasi dan situs web sejak 2017, meliputi HRIS, ERP, dan perangkat lunak operasional. Pada proyek yang bersifat menentukan, beliau tetap terlibat dalam arsitektur, peninjauan kode, dan keputusan yang tidak dapat didelegasikan.

PT. Dozer Napitupulu Technology merupakan badan hukum yang menaungi studio ini. Produk first-party kami adalah bukti kerja teknis: yang telah tayang ditandai secara jelas; yang masih dalam tahap beta tidak disajikan sebagai studi kasus.`,
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
    { name: 'Berangkat dari workflow', description: 'Kami mulai dari masalah kerja yang perlu dibuat lebih jelas dan terukur.', iconName: 'Wrench' },
    { name: 'Transparan', description: 'Scope, harga, timeline, dan status produk dijelaskan tanpa klaim berlebihan.', iconName: 'Handshake' },
    { name: 'Bukti lewat produk', description: 'Platform first-party kami menjadi bukti teknis yang bisa dilihat dan dicoba.', iconName: 'Target' },
    { name: 'Kualitas yang bisa dirawat', description: 'Code, testing, dokumentasi, dan support dipikirkan sejak awal.', iconName: 'CheckCircle' },
    { name: 'Terus memperbaiki', description: 'Kami belajar dari penggunaan nyata dan memperbaiki produk secara bertahap.', iconName: 'TrendingUp' },
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
