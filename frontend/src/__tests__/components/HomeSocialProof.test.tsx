import { render, screen } from '@testing-library/react';
import { HomePortfolio } from '@/components/homepage/HomePortfolio';
import { HomeTestimonials } from '@/components/homepage/HomeTestimonials';

import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/id/home.json';

function renderIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}


describe('homepage social-proof blocks', () => {
  it('renders nothing when portfolio is empty', () => {
    const { container } = renderIntl(<HomePortfolio projects={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('heading', { name: 'Portfolio' })).not.toBeInTheDocument();
  });

  it('renders nothing when testimonials are empty', () => {
    const { container } = renderIntl(<HomeTestimonials testimonials={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('heading', { name: 'Testimoni Publik' })).not.toBeInTheDocument();
  });
});
