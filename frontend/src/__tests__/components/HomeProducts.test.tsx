import { render, screen } from '@testing-library/react';
import { HomeProducts, pickHomepageProducts } from '@/components/homepage/HomeProducts';
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

describe('HomeProducts', () => {
  it('renders one lead product and a compact list, not a 3-column clone grid', () => {
    render(
      <HomeProducts
        products={[
          product({
            id: '1',
            name: 'dnPeople',
            slug: 'dnpeople',
            featured: true,
            tagline: 'HRIS',
          }),
          product({ id: '2', name: 'dnCore', slug: 'dncore', tagline: 'ERP' }),
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Produk first-party' })).toBeInTheDocument();
    expect(screen.getByText('Unggulan')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Buka dnPeople/ })).toHaveAttribute(
      'href',
      '/products/dnpeople',
    );
    expect(screen.getByRole('link', { name: /dnCore/ })).toHaveAttribute('href', '/products/dncore');
    expect(screen.queryByText('★')).not.toBeInTheDocument();
  });
});
