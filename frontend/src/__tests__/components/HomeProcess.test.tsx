import { render, screen } from '@testing-library/react';
import { HomeProcess } from '@/components/homepage/HomeProcess';
import type { HomeStep } from '@/lib/homepage-content';

import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/id/home.json';

function renderIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}


const steps: HomeStep[] = [
  { step: 1, title: 'Hubungi Kami', description: 'Konsultasi awal gratis.' },
  { step: 2, title: 'Scope & Quote', description: 'Kami buat proposal.' },
  { step: 3, title: 'Kick-off', description: 'Development dimulai.' },
];

describe('HomeProcess', () => {
  it('renders every step, in order, with its number and description', () => {
    renderIntl(<HomeProcess steps={steps} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Hubungi Kami',
      'Scope & Quote',
      'Kick-off',
    ]);

    expect(screen.getByText('Konsultasi awal gratis.')).toBeInTheDocument();
    expect(screen.getByText('Kami buat proposal.')).toBeInTheDocument();
    expect(screen.getByText('Development dimulai.')).toBeInTheDocument();

    // Step numbers are shown as visible badges next to each title, with a
    // translated "Langkah n" label alongside them.
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('Langkah 1')).toBeInTheDocument();
    expect(screen.getByText('Langkah 2')).toBeInTheDocument();
    expect(screen.getByText('Langkah 3')).toBeInTheDocument();
  });

  it('does not crash when given an empty steps list', () => {
    renderIntl(<HomeProcess steps={[]} />);

    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    expect(
      screen.getByRole('heading', { name: 'Gimana Cara Kerjanya?' }),
    ).toBeInTheDocument();
  });
});
