import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { PageTracker } from '@/components/common/PageTracker';
import { ExitIntentModal } from '@/components/interactive/ExitIntentModal';
import { StickyCTA } from '@/components/layout/StickyCTA';
import { JsonLd, organizationSchema, localBusinessSchema } from '@/components/seo/JsonLd';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={localBusinessSchema} />
      <PageTracker />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <StickyCTA />
      <ExitIntentModal />
    </>
  );
}
