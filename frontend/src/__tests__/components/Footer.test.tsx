import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/common/Footer';

describe('Footer', () => {
  it('lays out nav in four columns instead of a clustered link row', () => {
    render(
      <Footer
        companyEmail="info@dntech.id"
        companyPhone="+62 21 0000"
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Navigasi footer' });
    expect(nav.className).toMatch(/lg:grid-cols-4/);
    expect(screen.getByRole('heading', { name: 'Situs' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Produk & layanan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bantuan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hubungi' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Produk' })).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: 'Form kontak' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'info@dntech.id' })).toHaveAttribute(
      'href',
      'mailto:info@dntech.id',
    );
    expect(screen.getByRole('link', { name: 'Konsultasi Gratis' })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.queryByRole('link', { name: 'Karier' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Studi Kasus' })).not.toBeInTheDocument();
    expect(
      screen.getByText(/© \d{4} PT\. Dozer Napitupulu Technology\. Hak cipta dilindungi\./),
    ).toBeInTheDocument();
  });
});
