import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Building2,
  Clock,
  UserCircle2,
  ShieldCheck,
  Loader2,
  MailOpen,
  ArrowLeft,
} from 'lucide-react';
import { DashboardShell } from '../components/layout/DashboardShell';
import {
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
  type Invitation,
} from '../api/invitations';

// ─── Role badge colour map ────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  admin:  'bg-violet-500/15 text-violet-300 border-violet-500/30',
  member: 'bg-primary-500/15 text-primary-300 border-primary-500/30',
  viewer: 'bg-slate-500/15  text-slate-300  border-slate-500/30',
};

function roleBadge(role: string) {
  return ROLE_COLORS[role.toLowerCase()] ?? ROLE_COLORS['member'];
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function InvitationSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/5 bg-[#151f36] p-6">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/10" />
          <div className="h-3 w-1/3 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-5 flex gap-3">
        <div className="h-9 flex-1 rounded-xl bg-white/10" />
        <div className="h-9 flex-1 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}

// ─── Single invitation card ───────────────────────────────────────────────────
interface CardProps {
  invite: Invitation;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
}

function InvitationCard({ invite, onAccept, onDecline }: CardProps) {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [done, setDone]           = useState<'accepted' | 'declined' | null>(null);

  const expires  = new Date(invite.expiresAt);
  const daysLeft = Math.max(0, Math.ceil((expires.getTime() - Date.now()) / 86_400_000));
  const sentAt   = new Date(invite.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  async function handleAccept() {
    setAccepting(true);
    try {
      await onAccept(invite.id);
      setDone('accepted');
    } finally {
      setAccepting(false);
    }
  }

  async function handleDecline() {
    setDeclining(true);
    try {
      await onDecline(invite.id);
      setDone('declined');
    } finally {
      setDeclining(false);
    }
  }

  // Done state — brief confirmation before card disappears
  if (done) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-[#151f36] px-6 py-8 text-sm">
        {done === 'accepted' ? (
          <>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">
              You joined <span className="font-semibold">{invite.workspace || 'the workspace'}</span>!
            </span>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-slate-400" />
            <span className="text-slate-400">Invitation declined.</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="group rounded-2xl border border-white/5 bg-[#151f36] p-6 transition-all hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400">
          <Building2 className="h-6 w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-100">
              {invite.workspace || 'Unknown workspace'}
            </h3>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadge(invite.role)}`}>
              <ShieldCheck className="h-3 w-3" />
              {invite.role}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <UserCircle2 className="h-3.5 w-3.5 shrink-0" />
            Invited by{' '}
            <span className="font-medium text-slate-300">
              {invite.invitedBy || 'a workspace admin'}
            </span>
          </p>

          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Sent {sentAt}
            </span>
            <span className={`flex items-center gap-1 ${daysLeft <= 2 ? 'text-rose-400' : ''}`}>
              <Clock className="h-3 w-3" />
              {daysLeft === 0 ? 'Expires today' : `Expires in ${daysLeft}d`}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        <button
          id={`accept-invite-${invite.id}`}
          onClick={handleAccept}
          disabled={accepting || declining}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500/20 py-2.5 text-sm font-medium text-primary-400 transition-all hover:bg-primary-500 hover:text-white disabled:opacity-50"
        >
          {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Accept
        </button>
        <button
          id={`decline-invite-${invite.id}`}
          onClick={handleDecline}
          disabled={accepting || declining}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500/10 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500 hover:text-white disabled:opacity-50"
        >
          {declining ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
          Decline
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function InvitationsPage() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyInvitations();
      setInvitations(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (id: string) => {
    await acceptInvitation(id);
    setTimeout(() => setInvitations((prev) => prev.filter((i) => i.id !== id)), 1200);
  };

  const handleDecline = async (id: string) => {
    await declineInvitation(id);
    setTimeout(() => setInvitations((prev) => prev.filter((i) => i.id !== id)), 1200);
  };

  const pendingCount = invitations.length;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl px-4 py-10">

        {/* Page header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/10">
              <Bell className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Invitations</h1>
              <p className="text-sm text-slate-400">
                {loading
                  ? 'Loading…'
                  : pendingCount === 0
                  ? 'No pending invitations'
                  : `${pendingCount} pending invitation${pendingCount !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {error}{' '}
            <button onClick={load} className="underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            <InvitationSkeleton />
            <InvitationSkeleton />
            <InvitationSkeleton />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && pendingCount === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <MailOpen className="mb-4 h-12 w-12 text-slate-600" />
            <h2 className="text-base font-semibold text-slate-300">All caught up!</h2>
            <p className="mt-1 text-sm text-slate-500">
              You have no pending workspace invitations.
            </p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && pendingCount > 0 && (
          <div className="space-y-4">
            {invitations.map((invite) => (
              <InvitationCard
                key={invite.id}
                invite={invite}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
