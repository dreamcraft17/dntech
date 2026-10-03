import { render, screen } from '@testing-library/react';
import {
  HomeProducts,
  pickHomepageProducts,
  productMark,
} from '@/components/homepage/HomeProducts';
import type { Product } from '@/types';

import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/id/home.json';

function renderIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}


function product(partial: Partial<Product> & Pick<Product, 'id' | 'name' | 'slug'>): Product {
  return {
    description: `${partial.name} description`,
    ...partial,
  };
}

describe('pickHomepageProducts', () => {
  it('prefers the featured product and lists the rest compactly', () => {
    const products = [
      product({ id: '2', name: 'dnCore', slug: 'dncore' }),
      product({ id: '1', name: 'dnPeople', slug: 'dnpeople', featured: true }),
    ];
    const { featured, rest } = pickHomepageProducts(products);
    expect(featured?.slug).toBe('dnpeople');
    expect(rest.map((item) => item.slug)).toEqual(['dncore']);
  });
});

describe('productMark', () => {
  it('uses initials that distinguish sibling dn* products', () => {
    expect(productMark('dnPeople')).toBe('DP');
    expect(productMark('dnCore')).toBe('DC');
    expect(productMark('dnShop Finance')).toBe('DF');
    expect(productMark('Trusted Jurist')).toBe('TJ');
  });
});

describe('HomeProducts', () => {
  it('renders a featured panel plus a side rail, not a 3-column services clone', () => {
    const { container } = renderIntl(
      <HomeProducts
        products={[
          product({
            id: '1',
            name: 'dnPeople',
            slug: 'dnpeople',
            featured: true,
            category: 'HRIS',
            tagline: 'HRIS',
          }),
          product({ id: '2', name: 'dnCore', slug: 'dncore', tagline: 'ERP' }),
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Produk yang Membuktikan Cara Kami Bekerja' })).toBeInTheDocument();
    expect(screen.getByText('Unggulan')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Lihat dnPeople/ })).toHaveAttribute(
      'href',
      '/id/products/dnpeople',
    );
    expect(screen.getByRole('link', { name: /dnCore/ })).toHaveAttribute('href', '/id/products/dncore');
    expect(screen.queryByText('★')).not.toBeInTheDocument();
    expect(container.querySelector('.lg\\:grid-cols-3')).not.toBeInTheDocument();
    expect(container.querySelector('.lg\\:grid-cols-12')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Semua produk' })).toHaveAttribute('href', '/id/products');
  });
});
