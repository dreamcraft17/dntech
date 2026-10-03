import { render, screen } from '@testing-library/react';
import { HomeJobPaths } from '@/components/homepage/HomeJobPaths';

import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/id/home.json';

function renderIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}


describe('HomeJobPaths', () => {
  it('offers three problem-led entry points', () => {
    renderIntl(<HomeJobPaths />);

    expect(screen.getByRole('heading', { name: /Anda sedang mencoba/ })).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /Lihat jalurnya/ });
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', '/id/services');
    expect(links[1]).toHaveAttribute('href', '/id/contact?intent=workflow-integration');
    expect(links[2]).toHaveAttribute('href', '/id/products');
  });
});
