import { render, screen } from '@testing-library/react';
import {
  HomeProducts,
  pickHomepageProducts,
  productMark,
} from '@/components/homepage/HomeProducts';
import type { Product } from '@/types';

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
    const { container } = render(
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

    expect(screen.getByRole('heading', { name: 'Produk software siap pakai' })).toBeInTheDocument();
    expect(screen.getByText('Unggulan')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Lihat dnPeople/ })).toHaveAttribute(
      'href',
      '/products/dnpeople',
    );
    expect(screen.getByRole('link', { name: /dnCore/ })).toHaveAttribute('href', '/products/dncore');
    expect(screen.queryByText('★')).not.toBeInTheDocument();
    expect(container.querySelector('.lg\\:grid-cols-3')).not.toBeInTheDocument();
    expect(container.querySelector('.lg\\:grid-cols-12')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Semua produk' })).toHaveAttribute('href', '/products');
  });
});
