import { Shield, Award, CheckCircle, Zap, LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  shield: Shield,
  award: Award,
  check: CheckCircle,
  zap: Zap,
};

interface TrustBadgesProps {
  badges?: { icon?: string; label: string; description?: string }[];
}

export function TrustBadges({ badges }: TrustBadgesProps) {
  const items = Array.isArray(badges) ? badges.filter((b) => b.label) : [];
  if (!items.length) return null;

  return (
    <section className="py-12 bg-slate-50 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider mb-8">Dipercaya Pemimpin Industri</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((badge) => {
            const Icon = ICONS[badge.icon || 'check'] || CheckCircle;
            return (
              <div key={badge.label} className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="font-semibold text-slate-900 text-sm">{badge.label}</div>
                {badge.description && <div className="text-xs text-slate-500 mt-1">{badge.description}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
