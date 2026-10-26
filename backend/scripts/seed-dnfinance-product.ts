/**
 * Seed the dnFinance product page.
 * Source of truth: dnFinance/README.md and the current frontend navigation/API modules.
 * Run from backend/: npx tsx scripts/seed-dnfinance-product.ts
 */
import { prisma, upsertProduct } from './product-seed-shared';

const FEATURES = [
  {
    category: 'Akuntansi inti',
    icon: 'calculator',
    features: [
      { name: 'Daftar akun & template COA', description: 'Kelola chart of accounts sebagai fondasi pembukuan per data usaha.' },
      { name: 'Jurnal umum & buku besar', description: 'Catat transaksi dan telusuri mutasi akun dengan jejak audit.' },
      { name: 'Piutang & utang', description: 'Kelola invoice penjualan, tagihan pemasok, penerimaan, dan pembayaran.' },
      { name: 'Laporan keuangan', description: 'Akses laporan dan insight untuk membantu membaca kondisi usaha.' },
    ],
  },
  {
    category: 'Kas, bank & transaksi',
    icon: 'wallet',
    features: [
      { name: 'Kas masuk dan kas keluar', description: 'Catat penerimaan, pembayaran, dan transfer antar rekening.' },
      { name: 'Rekening bank & rekonsiliasi', description: 'Impor mutasi rekening, cocokkan transaksi, dan tandai perbedaan.' },
      { name: 'Anggaran', description: 'Buat anggaran, pantau sisa, dan kelola perpindahan anggaran.' },
      { name: 'Transaksi berulang', description: 'Siapkan transaksi rutin untuk mengurangi input manual.' },
    ],
  },
  {
    category: 'Penjualan, pembelian & persediaan',
    icon: 'package',
    features: [
      { name: 'Alur penjualan', description: 'Dari penawaran, order, pengiriman, invoice, sampai pelunasan piutang.' },
      { name: 'Alur pembelian', description: 'Kelola order pembelian, penerimaan, tagihan, retur, dan pembayaran pemasok.' },
      { name: 'Produk, jasa & gudang', description: 'Kelola item, satuan, kategori, merek, lokasi, dan stok.' },
      { name: 'Produksi & stok opname', description: 'Dukung pekerjaan pesanan, bahan baku, penyelesaian produksi, dan opname.' },
    ],
  },
  {
    category: 'Pajak & kontrol usaha',
    icon: 'shield-check',
    features: [
      { name: 'Pajak PPN dan PPh 21', description: 'Siapkan data dan laporan pajak dari transaksi usaha.' },
      { name: 'e-Faktur', description: 'Ekspor data e-Faktur sesuai alur yang tersedia di aplikasi.' },
      { name: 'Multi-tenant', description: 'Pisahkan data beberapa usaha dalam satu akun dengan konteks data usaha.' },
      { name: 'Role-based access & 2FA', description: 'Atur peran pengguna dan tambahkan verifikasi dua langkah untuk keamanan.' },
    ],
  },
];

const USE_CASES = [
  {
    id: 'owner-umkm',
    segment: 'Pemilik usaha dan UMKM',
    icon: 'briefcase',
    description: 'Lihat arus kas, penjualan, pembelian, dan laporan usaha dari satu dashboard tanpa menyatukan banyak spreadsheet.',
    uniqueFeatures: ['Dashboard ringkasan', 'Laporan keuangan', 'Multi-data usaha', 'Insight otomatis'],
    cta: { label: 'Lihat Demo', url: 'https://finance.dntech.id/login' },
  },
  {
    id: 'accounting-team',
    segment: 'Tim accounting dan finance',
    icon: 'calculator',
    description: 'Kerjakan jurnal, buku besar, piutang, utang, rekonsiliasi bank, dan laporan dalam workflow yang terhubung.',
    uniqueFeatures: ['Jurnal umum', 'Buku besar', 'Rekonsiliasi bank', 'Audit log'],
    cta: { label: 'Coba Demo', url: 'https://finance.dntech.id/login' },
  },
  {
    id: 'operations',
    segment: 'Tim operasional dan purchasing',
    icon: 'truck',
    description: 'Hubungkan penjualan, pembelian, gudang, dan stok supaya keputusan operasional tetap nyambung ke angka keuangan.',
    uniqueFeatures: ['Sales & purchasing', 'Inventory', 'Warehouse', 'Budget monitoring'],
    cta: { label: 'Pelajari Modul', url: 'https://finance.dntech.id/login' },
  },
];

const FAQ = [
  {
    question: 'dnFinance itu untuk siapa?',
    answer: 'dnFinance ditujukan untuk SME Indonesia, pemilik usaha, tim accounting, finance, dan operasional yang ingin mengelola pembukuan serta proses bisnis dalam satu platform.',
  },
  {
    question: 'Apakah dnFinance mendukung beberapa usaha?',
    answer: 'Ya. Arsitekturnya multi-tenant dan aplikasi menyediakan pemilih Data Usaha sehingga pengguna dapat berpindah konteks usaha dari satu akun.',
  },
  {
    question: 'Apakah tersedia aplikasi mobile native?',
    answer: 'Saat ini dnFinance adalah web app responsive berbasis React. Aplikasi dapat dipakai melalui browser desktop maupun HP; native Android/iOS belum menjadi klaim produk.',
  },
  {
    question: 'Apakah harga dan paket berlangganan sudah tersedia?',
    answer: 'Detail pricing publik belum ditetapkan di seed produk ini. Untuk demo dan kebutuhan deployment, hubungi tim DN Tech.',
  },
  {
    question: 'Apakah data dapat diekspor?',
    answer: 'dnFinance menyediakan modul laporan dan export pada alur yang didukung aplikasi. Format dan cakupan export mengikuti laporan atau modul terkait.',
  },
  {
    question: 'Teknologi apa yang digunakan?',
    answer: 'API menggunakan NestJS dan TypeScript, web app menggunakan React, Vite, Redux Toolkit, dan Tailwind CSS. Penyimpanan dapat menggunakan JSON file untuk development atau PostgreSQL saat dikonfigurasi.',
  },
];

const ROADMAP = [
  {
    quarter: 'Saat ini',
    status: 'in_progress',
    features: [
      { name: 'Core accounting & business operations', description: 'Akuntansi, kas-bank, sales, purchasing, inventory, tax, reporting, dan kontrol akses tersedia di aplikasi.' },
      { name: 'Dashboard yang dapat dikustomisasi', description: 'Widget dashboard, layout per pengguna, dan insight membantu pengguna memulai dari informasi yang paling penting.' },
      { name: 'Responsive web experience', description: 'Shell aplikasi dan dashboard dioptimalkan untuk desktop serta penggunaan melalui browser HP.' },
    ],
  },
  {
    quarter: 'Berikutnya',
    status: 'planned',
    features: [
      { name: 'Pendalaman integrasi dan otomasi', description: 'Pengembangan mengikuti kebutuhan deployment, validasi pengguna, dan prioritas operasional DN Tech.' },
    ],
  },
];

async function main() {
  console.log('Seeding dnFinance product...');

  const product = await upsertProduct({
    name: 'dnFinance',
    slug: 'dnfinance',
    category: 'Accounting / FinTech',
    displayOrder: 8,
    description:
      'Platform cloud accounting dan operasional bisnis untuk SME Indonesia — menghubungkan chart of accounts, jurnal, piutang, utang, kas-bank, inventory, pajak, dan laporan dalam satu data usaha.',
    data: {
      tagline: 'Pembukuan dan operasional usaha, nyambung dalam satu platform.',
      longFormContent: [
        '## Cloud accounting untuk usaha Indonesia',
        '',
        'dnFinance membantu pemilik usaha dan tim finance melihat angka yang sama dari pencatatan transaksi sampai laporan. Modul akuntansi, penjualan, pembelian, persediaan, kas-bank, pajak, dan laporan berada dalam satu workflow.',
        '',
        '**Dibuat untuk operasional harian** — catat jurnal, kelola invoice, pantau kas dan bank, cocokkan mutasi, kelola stok, lalu baca laporan tanpa memindahkan data antar aplikasi.',
        '',
        '**Satu akun, beberapa data usaha** — konteks perusahaan dipisahkan melalui arsitektur multi-tenant dan pemilih Data Usaha.',
        '',
        '**Status produk** — aktif dalam tahap beta/validasi. Fitur yang tersedia mengikuti modul dan konfigurasi deployment saat ini.',
      ].join('\n'),
      status: 'active',
      featured: true,
      showOnHomepage: true,
      launchStatus: 'beta',
      freemiumEnabled: false,
      trialDays: null,
      customerCount: 'Beta / validasi produk',
      features: FEATURES,
      useCases: USE_CASES,
      testimonials: [],
      roadmap: ROADMAP,
      techStack: [
        { name: 'API', technologies: ['NestJS 11', 'TypeScript', 'JWT', 'Swagger', 'Winston'] },
        { name: 'Web app', technologies: ['React 19', 'Vite 6', 'Redux Toolkit', 'Tailwind CSS 3.4'] },
        { name: 'Data & runtime', technologies: ['JSON file store untuk development', 'PostgreSQL opsional', 'Redis + Bull opsional'] },
        { name: 'Deployment', technologies: ['Docker', 'PM2', 'GCP Cloud Run staging'] },
      ],
      integrations: [
        { name: 'PostgreSQL', category: 'Database', description: 'Persistence opsional saat DATABASE_URL dikonfigurasi', status: 'available' },
        { name: 'Redis + Bull', category: 'Async jobs', description: 'Queue dan cache opsional saat REDIS_URL dikonfigurasi', status: 'available' },
        { name: 'Email SMTP / Gmail', category: 'Notification', description: 'Pengiriman email opsional melalui konfigurasi provider', status: 'available' },
        { name: 'REST API + Swagger', category: 'Developer', description: 'API backend untuk integrasi dan eksplorasi endpoint', status: 'available' },
      ],
      primaryCta: { label: 'Lihat Demo dnFinance', url: 'https://finance.dntech.id/login', type: 'demo', color: 'blue', size: 'lg' },
      secondaryCtas: [
        { label: 'Lihat Source Project', url: 'https://github.com/dreamcraft17/dnfinance', type: 'link' },
        { label: 'Hubungi DN Tech', url: '/contact?product=dnfinance', type: 'link' },
      ],
      demoUrl: 'https://finance.dntech.id/login',
      seoTitle: 'dnFinance — Cloud Accounting untuk SME Indonesia',
      seoDescription:
        'Platform cloud accounting dan operasional bisnis untuk SME Indonesia. Kelola jurnal, kas-bank, penjualan, pembelian, inventory, pajak, dan laporan dalam satu platform.',
      keywords: 'software akuntansi Indonesia, cloud accounting SME, pembukuan UMKM, laporan keuangan, kas bank, inventory, pajak PPN PPh',
      faq: FAQ,
    },
  });

  console.log(`dnFinance product seeded: ${product.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
