import { render, screen } from '@testing-library/react';
import { HomeHero } from '@/components/homepage/HomeHero';
import { resolveHomeContent } from '@/lib/homepage-content';

describe('HomeHero', () => {
  it('shows text-led hero with hero_bg.png as CSS background (no img tag)', () => {
    render(<HomeHero content={resolveHomeContent({})} />);

    const section = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(section).toHaveClass('bg-cover');
    expect(section).toHaveStyle({ backgroundImage: "url('/hero_bg.png')" });
    expect(section?.querySelector('img')).toBeNull();
    expect(screen.getByRole('complementary', { name: 'Fokus layanan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Konsultasi Gratis/ })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: 'Lihat Produk' })).toHaveAttribute('href', '/products');
    expect(screen.getAllByText(/DN Tech/).length).toBeGreaterThan(0);
  });
});
