import { render } from '@testing-library/react';
import { GoogleAnalytics, isValidGoogleMeasurementId } from '@/components/seo/GoogleAnalytics';

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <script {...props}>{children}</script>
  ),
}));

describe('GoogleAnalytics', () => {
  it('accepts valid GA4 measurement IDs', () => {
    expect(isValidGoogleMeasurementId('G-V6262D1WEE')).toBe(true);
    expect(isValidGoogleMeasurementId('UA-123456-1')).toBe(false);
    expect(isValidGoogleMeasurementId('')).toBe(false);
  });

  it('renders the GA4 loader and config for a valid ID', () => {
    const { container } = render(<GoogleAnalytics measurementId="G-V6262D1WEE" />);

    expect(container.querySelector('script[src="https://www.googletagmanager.com/gtag/js?id=G-V6262D1WEE"]'))
      .toBeInTheDocument();
    expect(container.textContent).toContain("gtag('config', 'G-V6262D1WEE')");
  });

  it('does not render a tag for an invalid ID', () => {
    const { container } = render(<GoogleAnalytics measurementId="not-a-measurement-id" />);

    expect(container.querySelector('script')).not.toBeInTheDocument();
  });
});
