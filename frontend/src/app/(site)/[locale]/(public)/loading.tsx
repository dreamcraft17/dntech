import { getTranslations } from 'next-intl/server';
import { PageLoading } from '@/components/ui/PageLoading';

export default async function Loading() {
  const [layout, ui] = await Promise.all([
    getTranslations('layout'),
    getTranslations('interactive.ui'),
  ]);

  return <PageLoading label={layout('loading')} waitLabel={ui('pleaseWait')} />;
}
