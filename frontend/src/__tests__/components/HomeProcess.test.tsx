import { render, screen } from '@testing-library/react';
import { HomeProcess } from '@/components/homepage/HomeProcess';
import type { HomeStep } from '@/lib/homepage-content';

const steps: HomeStep[] = [
  { step: 1, title: 'Hubungi Kami', description: 'Konsultasi awal gratis.' },
  { step: 2, title: 'Scope & Quote', description: 'Kami buat proposal.' },
  { step: 3, title: 'Kick-off', description: 'Development dimulai.' },
];

describe('HomeProcess', () => {
  it('renders every step, in order, with its number and description', () => {
    render(<HomeProcess steps={steps} />);

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual([
      'Hubungi Kami',
      'Scope & Quote',
      'Kick-off',
    ]);

    expect(screen.getByText('Konsultasi awal gratis.')).toBeInTheDocument();
    expect(screen.getByText('Kami buat proposal.')).toBeInTheDocument();
    expect(screen.getByText('Development dimulai.')).toBeInTheDocument();

    // Step numbers are shown as visible badges next to each title.
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('does not crash when given an empty steps list', () => {
    render(<HomeProcess steps={[]} />);

    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    expect(
      screen.getByRole('heading', { name: 'Gimana Cara Kerjanya?' }),
    ).toBeInTheDocument();
  });
});
