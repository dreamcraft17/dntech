import { render, screen } from '@testing-library/react';
import { HomeAdvantages } from '@/components/homepage/HomeAdvantages';
import type { HomeAdvantage } from '@/lib/homepage-content';

const advantages: HomeAdvantage[] = [
  { title: 'Harga Transparan', description: 'Tidak ada hidden fees.' },
  { title: 'Timeline Jelas', description: 'Kami sampaikan kapan selesai.' },
  { title: 'Tech Stack Modern', description: 'React, Next.js, PostgreSQL.' },
];

describe('HomeAdvantages', () => {
  it('renders every advantage, with the first one called out as the lead reason', () => {
    render(<HomeAdvantages advantages={advantages} />);

    // The lead advantage is distinguishable as a heading rendered under an
    // explicit "Alasan utama" (main reason) label.
    expect(screen.getByText('Alasan utama')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Harga Transparan' })).toBeInTheDocument();
    expect(screen.getByText('Tidak ada hidden fees.')).toBeInTheDocument();

    // The remaining advantages still render their title and description.
    expect(screen.getByRole('heading', { name: 'Timeline Jelas' })).toBeInTheDocument();
    expect(screen.getByText('Kami sampaikan kapan selesai.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tech Stack Modern' })).toBeInTheDocument();
    expect(screen.getByText('React, Next.js, PostgreSQL.')).toBeInTheDocument();
  });

  it('renders the lead advantage alone without crashing when it is the only one', () => {
    render(<HomeAdvantages advantages={[advantages[0]]} />);

    expect(screen.getByText('Alasan utama')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Harga Transparan' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Timeline Jelas' })).not.toBeInTheDocument();
  });

  it('renders nothing when there are no advantages', () => {
    const { container } = render(<HomeAdvantages advantages={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
