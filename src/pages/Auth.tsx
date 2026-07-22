import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useStore } from '../store';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useStore();
  const navigate = useNavigate();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;

      setSent(true);
      showToast('Magic link sent! Check your email.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10"
          >
            <Sparkles className="h-6 w-6 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold">
            {sent ? 'Check your inbox' : 'Welcome to OmniDraft'}
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {sent
              ? 'We sent a magic link to your email.'
              : 'Enter your email to sign in with a magic link.'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <Input
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              <Mail className="h-4 w-4" />
              Send Magic Link
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="mb-4 text-sm text-text-secondary">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
            >
              Try a different email
            </Button>
            <Button
              variant="ghost"
              className="ml-2"
              onClick={() => navigate('/')}
            >
              Back to home
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
