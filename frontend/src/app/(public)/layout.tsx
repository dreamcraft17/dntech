import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { PageTracker } from '@/components/common/PageTracker';
import { StickyCTA } from '@/components/layout/StickyCTA';
import { CrispChatLoader } from '@/components/interactive/CrispChatLoader';
import { ExitIntentModalLoader } from '@/components/interactive/ExitIntentModalLoader';
import { AnalyticsLoader } from '@/components/seo/AnalyticsLoader';
import {
  JsonLd,
  buildOrganizationSchema,
  buildLocalBusinessSchema,
  buildWebsiteSchema,
} from '@/components/seo/JsonLd';
import { getPublicSettings } from '@/lib/settings';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();

  return (
    <>
      <JsonLd data={buildOrganizationSchema(settings)} />
      <JsonLd data={buildLocalBusinessSchema(settings)} />
      <JsonLd data={buildWebsiteSchema(settings)} />
      <PageTracker />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer
        companyName={settings.companyName}
        tagline={settings.tagline}
        companyEmail={settings.companyEmail}
        companyPhone={settings.companyPhone}
        companyAddress={settings.companyAddress}
      />
      <StickyCTA />
      <ExitIntentModalLoader />
      <CrispChatLoader crispWebsiteId={settings.crispWebsiteId} />
      <AnalyticsLoader googleAnalyticsId={settings.googleAnalyticsId} />
    </>
  );
}
