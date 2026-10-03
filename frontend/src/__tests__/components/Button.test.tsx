import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { Button } from '@/components/ui/Button';
import messages from '@/messages/id/interactive.json';

// Internal hrefs render through the locale-aware Link from @/i18n/navigation,
// which needs an intl context.
function render(ui: React.ReactElement) {
  return rtlRender(
    <NextIntlClientProvider locale="id" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('Button', () => {
  it('renders button label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('fires click handler', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Submit</Button>);
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as link with href', () => {
    render(<Button href="/about">About</Button>);
    const link = screen.getByRole('link', { name: /about/i });
    expect(link).toHaveAttribute('href', '/id/about');
  });

  it('disables when loading', () => {
    render(<Button loading>Saving</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
