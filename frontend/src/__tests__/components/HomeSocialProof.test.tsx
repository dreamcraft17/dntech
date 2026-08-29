import { render, screen } from '@testing-library/react';
import { HomePortfolio } from '@/components/homepage/HomePortfolio';
import { HomeTestimonials } from '@/components/homepage/HomeTestimonials';

describe('homepage social-proof blocks', () => {
  it('renders nothing when portfolio is empty', () => {
    const { container } = render(<HomePortfolio projects={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('heading', { name: 'Portfolio' })).not.toBeInTheDocument();
  });

  it('renders nothing when testimonials are empty', () => {
    const { container } = render(<HomeTestimonials testimonials={[]} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('heading', { name: 'Testimoni Publik' })).not.toBeInTheDocument();
  });
});
