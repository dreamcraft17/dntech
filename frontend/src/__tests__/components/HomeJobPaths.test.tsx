import { render, screen } from '@testing-library/react';
import { HomeJobPaths } from '@/components/homepage/HomeJobPaths';

describe('HomeJobPaths', () => {
  it('offers three problem-led entry points', () => {
    render(<HomeJobPaths />);

    expect(screen.getByRole('heading', { name: /Anda sedang mencoba/ })).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: /Lihat jalurnya/ });
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', '/services');
    expect(links[1]).toHaveAttribute('href', '/contact?intent=workflow-integration');
    expect(links[2]).toHaveAttribute('href', '/products');
  });
});
