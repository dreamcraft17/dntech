import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Kebijakan Privasi' };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function getPrivacy() {
  try {
    const res = await fetch(`${API_URL}/settings/legal/privacy`, { next: { revalidate: 3600 } });
    if (!res.ok) return '';
    return (await res.json()).data.content as string;
  } catch {
    return '<h1>Kebijakan Privasi</h1><p>Konten segera hadir.</p>';
  }
}

export default async function PrivacyPage() {
  const content = await getPrivacy();

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
}
