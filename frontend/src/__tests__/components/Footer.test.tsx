import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { Footer } from '@/components/common/Footer';
import messages from '@/messages/id/common.json';

function renderFooter() {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <Footer companyEmail="info@dntech.id" companyPhone="+62 21 0000" />
    </NextIntlClientProvider>,
  );
}

describe('Footer', () => {
  it('lays out nav in five columns with proof and resources', () => {
    renderFooter();

    const nav = screen.getByRole('navigation', { name: 'Navigasi footer' });
    expect(nav.className).toMatch(/lg:grid-cols-5/);
    expect(screen.getByRole('heading', { name: 'Perusahaan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Produk & layanan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bukti kerja' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Resources' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hubungi' })).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Produk' })).toHaveAttribute('href', '/id/products');
    expect(screen.getByRole('link', { name: 'Studi kasus' })).toHaveAttribute(
      'href',
      '/id/case-studies',
    );
    expect(screen.getByRole('link', { name: 'Karier' })).toHaveAttribute('href', '/id/careers');
    expect(screen.getByRole('link', { name: 'info@dntech.id' })).toHaveAttribute(
      'href',
      'mailto:info@dntech.id',
    );
    expect(screen.getByRole('link', { name: /WhatsApp \+62 21 0000/ })).toHaveAttribute(
      'href',
      'https://wa.me/62210000',
    );
    expect(screen.getByRole('link', { name: 'Konsultasi Gratis' })).toHaveAttribute(
      'href',
      '/id/contact',
    );
    expect(
      screen.getByText(/© \d{4} PT\. Dozer Napitupulu Technology\. Hak cipta dilindungi\./),
    ).toBeInTheDocument();
  });
});
