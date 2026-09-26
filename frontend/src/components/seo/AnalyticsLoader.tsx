import { GoogleAnalytics } from './GoogleAnalytics';

interface AnalyticsLoaderProps {
  googleAnalyticsId?: string;
}

export function AnalyticsLoader({ googleAnalyticsId }: AnalyticsLoaderProps) {
  return <GoogleAnalytics measurementId={googleAnalyticsId} />;
}
