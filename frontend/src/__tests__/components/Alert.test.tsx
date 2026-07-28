import { fireEvent, render, screen } from '@testing-library/react';
import { Alert } from '@/components/ui/Alert';

describe('Alert component', () => {
  it('renders title and body', () => {
    render(<Alert title="Info">Body text</Alert>);
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('supports close action', () => {
    const onClose = jest.fn();
    render(
      <Alert variant="warning" onClose={onClose}>
        Warning
      </Alert>
    );
    fireEvent.click(screen.getByRole('button', { name: /tutup/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders all variants', () => {
    const variants = ['error', 'success', 'warning', 'info'] as const;
    for (const variant of variants) {
      const { unmount } = render(<Alert variant={variant}>x</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      unmount();
    }
  });
});
