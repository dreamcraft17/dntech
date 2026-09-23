import { render, screen } from '@testing-library/react';
import { HomeHero } from '@/components/homepage/HomeHero';
import { resolveHomeContent } from '@/lib/homepage-content';

describe('HomeHero', () => {
  it('shows the hero background behind a clear text-led layout', () => {
    render(<HomeHero content={resolveHomeContent({})} />);

    const section = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(section).toHaveClass('bg-[var(--primary)]');
    expect(section?.querySelector('img[src="/hero_bg.png"]')).toBeTruthy();
    expect(screen.getByRole('complementary', { name: 'Fokus layanan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Konsultasi Gratis/ })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.getByRole('link', { name: 'Lihat Produk' })).toHaveAttribute('href', '/products');
    expect(screen.getAllByText(/DN Tech/).length).toBeGreaterThan(0);
  });
});
