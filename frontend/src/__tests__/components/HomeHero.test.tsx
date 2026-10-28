import { render, screen } from '@testing-library/react';
import { HomeHero } from '@/components/homepage/HomeHero';
import { resolveHomeContent } from '@/lib/homepage-content';

import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/id/home.json';

function renderIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}


describe('HomeHero', () => {
  it('shows text-led hero with hero_bg on depth layer and decorative mark only', () => {
    renderIntl(<HomeHero content={resolveHomeContent({})} />);

    const section = screen.getByRole('heading', { level: 1 }).closest('section');
    expect(section).toHaveClass('scene-hero');
    const depth0 = section?.querySelector('[data-depth="0"]');
    expect(depth0).toHaveStyle({ backgroundImage: "url('/hero_bg.png')" });
    const imgs = section?.querySelectorAll('img') ?? [];
    expect(imgs.length).toBe(1);
    expect(imgs[0]).toHaveAttribute('src', '/round.png');
    expect(screen.getByRole('complementary', { name: 'Fokus layanan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Konsultasi Gratis/ })).toHaveAttribute(
      'href',
      '/id/contact',
    );
    expect(screen.getByRole('link', { name: 'Lihat Produk' })).toHaveAttribute(
      'href',
      '/id/products',
    );
    expect(screen.getAllByText(/DN Tech/).length).toBeGreaterThan(0);
  });
});
