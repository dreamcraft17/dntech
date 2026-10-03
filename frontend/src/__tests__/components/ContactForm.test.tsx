import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ContactForm } from '@/components/forms/ContactForm';
import messages from '@/messages/id/pages.json';

function renderForm() {
  return render(
    <NextIntlClientProvider locale="id" messages={messages}>
      <ContactForm />
    </NextIntlClientProvider>,
  );
}

describe('ContactForm component', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock | undefined) = jest.fn();
  });

  it('shows validation errors for invalid form', async () => {
    renderForm();
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
    renderForm();
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
    renderForm();
    fireEvent.change(screen.getByLabelText(/nama/i), { target: { value: 'Dozer' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'dozer@example.com' } });
    fireEvent.change(screen.getByLabelText(/pesan/i), { target: { value: 'Ini pesan panjang untuk validasi.' } });
    fireEvent.click(screen.getByRole('button', { name: /kirim pesan/i }));
    await waitFor(() => expect(screen.getByText('API down')).toBeInTheDocument());
  });
});
