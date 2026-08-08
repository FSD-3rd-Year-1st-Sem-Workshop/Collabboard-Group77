import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button } from '../components/common/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
      <Compass className="h-10 w-10 text-slate-300" />
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/dashboard">
        <Button>Back to My Boards</Button>
      </Link>
    </div>
  );
}
