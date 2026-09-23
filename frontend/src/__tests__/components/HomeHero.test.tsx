import { render, screen } from '@testing-library/react';
import { HomeHero } from '@/components/homepage/HomeHero';
import { resolveHomeContent } from '@/lib/homepage-content';

describe('HomeHero', () => {
  it('shows a clear text-led hero with a solid primary background', () => {
    render(<HomeHero content={resolveHomeContent({})} />);

    const section = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(section).toHaveClass('bg-[var(--primary)]');
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
