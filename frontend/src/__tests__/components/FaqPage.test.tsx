import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import FaqPage from '@/app/(site)/[locale]/(public)/faq/page';
import enPages from '@/messages/en/pages.json';

let mockQuery = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockQuery,
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@/components/layout/PageEndCta', () => ({ PageEndCta: () => null }));

const fetchMock = jest.fn();

function renderFaq() {
  return render(
    <NextIntlClientProvider locale="en" messages={enPages}>
      <FaqPage />
    </NextIntlClientProvider>,
  );
}

function requestedSearch(callIndex: number) {
  const url = String(fetchMock.mock.calls[callIndex][0]);
  return new URL(url, 'http://localhost').searchParams.get('search');
}

describe('FaqPage search from URL', () => {
  beforeEach(() => {
    mockQuery = new URLSearchParams();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ json: async () => ({ data: [] }) });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('starts with the ?search= term and queries the API with it on the first fetch', async () => {
    mockQuery = new URLSearchParams('search=  pricing  ');
    renderFaq();

    expect(screen.getByRole('searchbox', { name: 'Search frequently asked questions' })).toHaveValue('pricing');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(requestedSearch(0)).toBe('pricing');
  });

  it('starts empty and does not send a search filter when there is no ?search=', async () => {
    renderFaq();

    expect(screen.getByRole('searchbox')).toHaveValue('');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(requestedSearch(0)).toBeNull();
  });

  it('follows a new ?search= value while the page stays mounted', async () => {
    mockQuery = new URLSearchParams('search=hris');
    const view = renderFaq();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    mockQuery = new URLSearchParams('search=payroll');
    view.rerender(
      <NextIntlClientProvider locale="en" messages={enPages}>
        <FaqPage />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole('searchbox')).toHaveValue('payroll');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(requestedSearch(1)).toBe('payroll');
  });
});
