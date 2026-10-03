import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ProductCatalog } from '@/app/(site)/[locale]/(public)/products/ProductCatalog';
import messages from '@/messages/id/catalog.json';
import type { Product } from '@/types';

const product = {
  id: '1',
  slug: 'dnpeople',
  name: 'dnPeople',
  description: 'HRIS untuk tim yang sedang tumbuh.',
  category: 'HR',
  featured: true,
  launchStatus: 'launched',
  pricingTiers: [{ id: 't1', name: 'Starter', pricing: { amount: 250000 }, features: [], cta: { label: 'Mulai', url: '/contact' } }],
} as unknown as Product;

function renderCatalog(products: Product[]) {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <ProductCatalog initialProducts={products} />
    </NextIntlClientProvider>
  );
}

describe('ProductCatalog', () => {
  it('renders translated chrome around CMS content', () => {
    renderCatalog([product]);

    expect(screen.getByLabelText('Filter kategori produk')).toBeInTheDocument();
    expect(screen.getByText('Semua')).toBeInTheDocument();
    expect(screen.getByText('Tersedia')).toBeInTheDocument();
    expect(screen.getByText('Produk pilihan')).toBeInTheDocument();
    expect(screen.getByText('Lihat detail')).toBeInTheDocument();
    // CMS-owned copy is passed through untranslated.
    expect(screen.getByText('dnPeople')).toBeInTheDocument();
  });

  it('formats the starting price for the active locale', () => {
    renderCatalog([product]);
    expect(screen.getByText(/^Mulai dari/)).toBeInTheDocument();
  });
});
