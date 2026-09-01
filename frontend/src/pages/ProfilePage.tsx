import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { CheckCircle2, KeyRound, UserRoundPen } from 'lucide-react';
import { getProfileApi, updateProfileApi, changePasswordApi } from '../api/auth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/input';
import { Textarea } from '../components/common/Textarea';
import { DashboardShell } from '../components/layout/DashboardShell';
import { useAuth } from '../hooks/useAuth';

type Notice = { tone: 'success' | 'error'; message: string } | null;

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileNotice, setProfileNotice] = useState<Notice>(null);
  const [passwordNotice, setPasswordNotice] = useState<Notice>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfileApi();
        setFullName(profile.fullName);
        setEmail(profile.email);
        setBio(profile.bio);
        setAvatar(profile.avatar ?? '');
        updateUser(profile);
      } catch {
        setProfileNotice({ tone: 'error', message: 'Unable to load your latest profile details.' });
      }
    }
    void loadProfile();
  }, [updateUser]);

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileNotice(null);
    try {
      const profile = await updateProfileApi({ fullName, bio, avatar: avatar.trim() || null });
      updateUser(profile);
      setProfileNotice({ tone: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      setProfileNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChangingPassword(true);
    setPasswordNotice(null);
    try {
      const profile = await changePasswordApi({ currentPassword, newPassword });
      updateUser(profile);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordNotice({ tone: 'success', message: 'Password changed and your session was renewed.' });
    } catch (error) {
      setPasswordNotice({ tone: 'error', message: error instanceof Error ? error.message : 'Unable to change password.' });
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-5xl px-6 py-8 md:px-10">
        <p className="text-sm font-medium text-primary-300">Account settings</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-100">Edit profile</h1>
        <p className="mt-2 text-sm text-slate-400">Keep your team-facing details current and your account secure.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-[#101a2e] p-6 shadow-xl shadow-slate-950/10">
            <SectionHeading icon={<UserRoundPen className="h-5 w-5" />} title="Profile details" description="Update the information your teammates see." />
            <form className="space-y-4" onSubmit={handleProfileSave}>
              <Input id="profile-full-name" label="Full name" value={fullName} minLength={6} maxLength={60} onChange={(event) => setFullName(event.target.value)} required />
              <Input id="profile-email" label="Email address" value={email} disabled />
              <Input id="profile-avatar" label="Avatar URL (optional)" type="url" placeholder="https://example.com/avatar.jpg" value={avatar} onChange={(event) => setAvatar(event.target.value)} />
              <Textarea id="profile-bio" label="Bio" rows={4} maxLength={500} placeholder="Tell your teammates a little about yourself" value={bio} onChange={(event) => setBio(event.target.value)} />
              {profileNotice && <NoticeMessage notice={profileNotice} />}
              <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Saving…' : 'Save profile'}</Button>
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#101a2e] p-6 shadow-xl shadow-slate-950/10">
            <SectionHeading icon={<KeyRound className="h-5 w-5" />} title="Change password" description="Choose a new password of at least 8 characters." />
            <form className="space-y-4" onSubmit={handlePasswordChange}>
              <Input id="current-password" label="Current password" type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
              <Input id="new-password" label="New password" type="password" autoComplete="new-password" minLength={8} maxLength={72} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
              {passwordNotice && <NoticeMessage notice={passwordNotice} />}
              <Button type="submit" disabled={changingPassword}>{changingPassword ? 'Changing…' : 'Change password'}</Button>
            </form>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}

function SectionHeading({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/15 text-primary-300">{icon}</div><div><h2 className="font-semibold text-slate-100">{title}</h2><p className="text-sm text-slate-400">{description}</p></div></div>;
}

function NoticeMessage({ notice }: { notice: NonNullable<Notice> }) {
  const tone = notice.tone === 'success' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/20 bg-rose-400/10 text-rose-200';
  return <p className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${tone}`}><CheckCircle2 className="h-4 w-4 shrink-0" />{notice.message}</p>;
}
