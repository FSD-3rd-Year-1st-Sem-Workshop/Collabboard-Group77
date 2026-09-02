import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();

  return (
    <DashboardShell>
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#0b1220] p-6">
        <EmptyState
          icon={Clock}
          title="Board View Under Construction"
          description={`Fetching board data for ID: ${boardId} is not wired up yet, but authentication and routing work!`}
        />
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    </DashboardShell>
  );
}
