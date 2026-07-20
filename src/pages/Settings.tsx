import { motion } from 'framer-motion';
import { User, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Settings() {
  const { user, signOut } = useAuth();

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-2 text-2xl font-bold">Settings</h1>
        <p className="mb-8 text-sm text-text-secondary">
          Manage your account and preferences.
        </p>

        <Card className="space-y-6 p-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
            Account
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {user?.email || 'Signed out'}
              </p>
              <p className="text-xs text-text-secondary">
                Signed in via Supabase
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-text-secondary">
              <Mail className="h-4 w-4" />
              <span>{user?.email || 'N/A'}</span>
            </div>
            {user?.created_at && (
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-glass-border pt-4">
            <Button variant="danger" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
