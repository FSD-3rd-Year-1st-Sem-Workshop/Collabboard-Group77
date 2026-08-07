import type { LucideIcon } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { EmptyState } from '@/components/common/EmptyState';

interface ComingSoonPageProps {
  title: string;
  icon: LucideIcon;
}

export function ComingSoonPage({ title, icon }: ComingSoonPageProps) {
  return (
    <DashboardShell>
      <div className="p-6">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">{title}</h1>
        <EmptyState icon={icon} title={`${title} is coming soon`} description="This section isn't built yet." />
      </div>
    </DashboardShell>
  );
}
