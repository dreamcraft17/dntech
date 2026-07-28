import { render, screen } from '@testing-library/react';
import { Card } from '@/components/ui/Card';

describe('Card component', () => {
  it('renders title and description', () => {
    render(<Card title="Title" description="Desc" />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });

  it('renders body and footer blocks', () => {
    render(<Card footer={<span>Footer</span>}>Body</Card>);
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('supports hover mode', () => {
    render(<Card hover>Hover</Card>);
    expect(screen.getByText('Hover')).toBeInTheDocument();
  });
});
