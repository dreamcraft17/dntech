import { PublicPageCta } from '@/components/layout/PublicPageShell';

/** Shared Mekari-style conversion band for catalog / proof pages. */
export function PageEndCta() {
  return (
    <PublicPageCta
      title="Butuh bantuan memilih jalur yang tepat?"
      description="Ceritakan workflow yang ingin dirapikan. Kami akan arahkan ke produk, layanan, atau langkah berikutnya yang paling masuk akal."
      primaryHref="/contact"
      primaryLabel="Konsultasi gratis"
      secondaryHref="/quiz"
      secondaryLabel="Temukan solusi"
    />
  );
}
