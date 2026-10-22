import { GoogleAnalytics } from './GoogleAnalytics';
import { WebVitals } from './WebVitals';

interface AnalyticsLoaderProps {
  googleAnalyticsId?: string;
}

export function AnalyticsLoader({ googleAnalyticsId }: AnalyticsLoaderProps) {
  return (
    <>
      <GoogleAnalytics measurementId={googleAnalyticsId} />
      <WebVitals measurementId={googleAnalyticsId} />
    </>
  );
}
