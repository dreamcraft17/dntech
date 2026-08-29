import { render, screen } from '@testing-library/react';
import { HomeHero } from '@/components/homepage/HomeHero';
import { resolveHomeContent } from '@/lib/homepage-content';

describe('HomeHero', () => {
  it('uses solid primary fill with no background image on the LCP path', () => {
    render(<HomeHero content={resolveHomeContent({})} />);

    const section = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(section).toHaveClass('bg-[var(--primary)]');
    expect(section).not.toHaveStyle({ backgroundImage: "url('/hero_bg.png')" });
    expect(screen.getByRole('link', { name: /Konsultasi Gratis/ })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: 'Lihat Produk' })).toHaveAttribute('href', '/products');
  });
});
