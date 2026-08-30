import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/common/input';
import { Button } from '../components/common/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const trimmedName = name.trim();

    if (!trimmedName || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!agreedToTerms) {
      setError('You need to agree to the Terms & Conditions to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: trimmedName,
          email: email.trim(),
          password,
          bio: bio.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data?.message || 'Registration failed. Please try again.');
        return;
      }

      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      setError('Unable to connect to the backend server.');
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start collaborating with your team"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="register-name"
          label="Full Name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
        <Input
          id="register-email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          id="register-password"
          label="Password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Input
          id="register-confirm-password"
          label="Confirm Password"
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        
        <Input
          id="bio"
          label="Profile Bio"
          placeholder="A Machine-Learning Engineer Loves to Explore..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          autoComplete="off"
          required
        />


        {error && <p className="text-sm text-rose-600">{error}</p>}

        <label className="flex items-start gap-2 text-sm text-slate-400">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
          />
          I agree to the{' '}
          <a href="#" className="font-medium text-primary-600 hover:underline">
            Terms &amp; Conditions
          </a>
        </label>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </Button>
      </form>
    </AuthLayout>
  );
}
