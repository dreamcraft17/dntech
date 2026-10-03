import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { HeaderSearch } from '@/components/common/HeaderSearch';
import { apiFetch } from '@/lib/api';
import idMessages from '@/messages/id/common.json';
import enMessages from '@/messages/en/common.json';

jest.mock('@/lib/api', () => ({
  ...jest.requireActual('@/lib/api'),
  apiFetch: jest.fn(),
}));

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockedApiFetch = apiFetch as jest.Mock;

function renderSearch(locale: 'id' | 'en') {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === 'en' ? enMessages : idMessages}>
      <HeaderSearch open onClose={jest.fn()} />
    </NextIntlClientProvider>,
  );
}

describe('HeaderSearch', () => {
  beforeEach(() => {
    mockedApiFetch.mockReset();
    mockedApiFetch.mockResolvedValue([]);
  });

  it('asks the API for results in the active locale', async () => {
    const user = userEvent.setup();
    renderSearch('en');

    await user.type(screen.getByRole('searchbox'), 'hris');

    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalled());
    const endpoint = mockedApiFetch.mock.calls.at(-1)?.[0] as string;
    const params = new URLSearchParams(endpoint.split('?')[1]);
    expect(endpoint.startsWith('/search?')).toBe(true);
    expect(params.get('q')).toBe('hris');
    expect(params.get('locale')).toBe('en');
  });

  it('requests Indonesian results on the Indonesian route', async () => {
    const user = userEvent.setup();
    renderSearch('id');

    await user.type(screen.getByRole('searchbox'), 'hris');

    await waitFor(() => expect(mockedApiFetch).toHaveBeenCalled());
    const endpoint = mockedApiFetch.mock.calls.at(-1)?.[0] as string;
    expect(new URLSearchParams(endpoint.split('?')[1]).get('locale')).toBe('id');
  });
});
