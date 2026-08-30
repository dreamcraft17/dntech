import { render, screen } from '@testing-library/react';
import { HomeServices } from '@/components/homepage/HomeServices';
import type { Service } from '@/types';
import type { HomeServiceCard } from '@/lib/homepage-content';

function service(partial: Partial<Service> & Pick<Service, 'id' | 'name' | 'slug'>): Service {
  return {
    description: `${partial.name} description`,
    ...partial,
  };
}

const defaults: HomeServiceCard[] = [
  { name: 'Web App Development', description: 'Dashboard dan web application.' },
  { name: 'Mobile App Development', description: 'Aplikasi iOS & Android.' },
];

describe('HomeServices', () => {
  it('renders services from real API data and links each card to its slug', () => {
    const services = [
      service({ id: '1', name: 'Web App Development', slug: 'web-app-development' }),
      service({ id: '2', name: 'Mobile App Development', slug: 'mobile-app-development' }),
    ];

    render(<HomeServices services={services} defaults={defaults} />);

    expect(
      screen.getByRole('heading', { name: 'Apa yang Kami Tawarkan' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Web App Development/ }),
    ).toHaveAttribute('href', '/services/web-app-development');
    expect(
      screen.getByRole('link', { name: /Mobile App Development/ }),
    ).toHaveAttribute('href', '/services/mobile-app-development');
  });

  it('falls back to the default service cards when the API list is empty', () => {
    render(<HomeServices services={[]} defaults={defaults} />);

    expect(screen.getByText('Web App Development')).toBeInTheDocument();
    expect(screen.getByText('Dashboard dan web application.')).toBeInTheDocument();
    expect(screen.getByText('Mobile App Development')).toBeInTheDocument();

    // Default cards have no slug, so they render as plain (non-link) cards.
    expect(screen.queryByRole('link', { name: /Web App Development/ })).not.toBeInTheDocument();
  });

  it('always links to the full services listing', () => {
    render(<HomeServices services={[]} defaults={defaults} />);
    expect(screen.getByRole('link', { name: /Lihat semua layanan/ })).toHaveAttribute(
      'href',
      '/services',
    );
  });
});
