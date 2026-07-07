/** Default service delivery process — PRD v2 §4.3 */

export const SERVICE_PROCESS_STEPS = [
  {
    step: 1,
    title: 'Discovery & Scope',
    description: 'Memahami kebutuhan bisnis, user, dan constraint teknis proyek Anda.',
  },
  {
    step: 2,
    title: 'Perencanaan & Estimasi',
    description: 'Menyusun roadmap, timeline, dan estimasi biaya yang transparan.',
  },
  {
    step: 3,
    title: 'Development Iteratif',
    description: 'Pengembangan bertahap dengan demo berkala dan feedback loop.',
  },
  {
    step: 4,
    title: 'Testing & QA',
    description: 'Pengujian fungsional, keamanan dasar, dan persiapan production.',
  },
  {
    step: 5,
    title: 'Launch & Dukungan',
    description: 'Deployment, handover dokumentasi, dan opsi maintenance berkelanjutan.',
  },
] as const;
