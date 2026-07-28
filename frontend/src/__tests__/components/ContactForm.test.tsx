import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ContactForm } from '@/components/forms/ContactForm';

describe('ContactForm component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock | undefined) = jest.fn();
  });

  it('shows validation errors for invalid form', async () => {
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText(/nama/i), { target: { value: 'Dozer' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'dozer@example.com' } });
    fireEvent.change(screen.getByLabelText(/pesan/i), { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /kirim pesan/i }));
    expect(await screen.findByText(/pesan minimal 10 karakter/i)).toBeInTheDocument();
  });

  it('submits successfully and shows success state', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText(/nama/i), { target: { value: 'Dozer' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'dozer@example.com' } });
    fireEvent.change(screen.getByLabelText(/pesan/i), { target: { value: 'Ini pesan panjang untuk validasi.' } });
    fireEvent.click(screen.getByRole('button', { name: /kirim pesan/i }));
    expect(await screen.findByText(/terima kasih/i)).toBeInTheDocument();
  });

  it('shows API error when submission fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: false, error: { message: 'API down' } }),
    });
    render(<ContactForm />);
    fireEvent.change(screen.getByLabelText(/nama/i), { target: { value: 'Dozer' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'dozer@example.com' } });
    fireEvent.change(screen.getByLabelText(/pesan/i), { target: { value: 'Ini pesan panjang untuk validasi.' } });
    fireEvent.click(screen.getByRole('button', { name: /kirim pesan/i }));
    await waitFor(() => expect(screen.getByText('API down')).toBeInTheDocument());
  });
});
