'use client';

import dynamic from 'next/dynamic';

const ExitIntentModal = dynamic(
  () => import('@/components/interactive/ExitIntentModal').then((mod) => mod.ExitIntentModal),
  { ssr: false }
);

export function ExitIntentModalLoader() {
  return <ExitIntentModal />;
}
