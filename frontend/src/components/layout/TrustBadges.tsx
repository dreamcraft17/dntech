import { Shield, Award, CheckCircle, Zap, LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  award: Award,
  check: CheckCircle,
  zap: Zap,
};

interface TrustBadgesProps {
  badges?: { icon?: string; label: string; description?: string }[];
  title?: string;
}

export function TrustBadges({ badges, title = 'Mengapa Memilih Kami' }: TrustBadgesProps) {
  const items = Array.isArray(badges) ? badges.filter((b) => b.label) : [];
  if (!items.length) return null;

  return (
    <section className="py-16 bg-white border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 mb-10">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((badge) => {
            const Icon = ICONS[badge.icon || 'check'] || CheckCircle;
            return (
              <div key={badge.label} className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-lg bg-blue-900/10 flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-blue-900" />
                </div>
                <div className="font-semibold text-gray-900">{badge.label}</div>
                {badge.description && <div className="text-sm text-gray-600 mt-2">{badge.description}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
