import { render, screen } from '@testing-library/react';
import { SectionHeading } from '@/components/homepage/SectionHeading';

describe('SectionHeading', () => {
  it('left-aligns sentence-case titles without uppercase transform', () => {
    const { container } = render(
      <SectionHeading title="Produk first-party" subtitle="Operasikan sendiri" />,
    );

    const wrap = container.firstChild as HTMLElement;
    expect(wrap.className).toMatch(/text-left/);
    expect(wrap.className).not.toMatch(/text-center/);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Produk first-party');
    expect(heading.className).not.toMatch(/uppercase/);
  });
});
