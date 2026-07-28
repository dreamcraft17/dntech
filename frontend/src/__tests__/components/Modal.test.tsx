import { fireEvent, render, screen } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  it('does not render when closed', () => {
    render(
      <Modal open={false} onClose={jest.fn()} title="Modal">
        Content
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders and closes via close button', () => {
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="Modal">
        Content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /tutup modal/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
