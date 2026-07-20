import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, LogOut, User } from 'lucide-react';
import { useStore } from '../../store';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useStore();
  const location = useLocation();

  return (
    <nav className="glass sticky top-0 z-40 flex h-14 items-center justify-between border-b border-glass-border px-4">
      <div className="flex items-center gap-3">
        {user && location.pathname !== '/' && (
          <button
            onClick={toggleSidebar}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">OmniDraft</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link
              to="/settings"
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user.email}</span>
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm text-text-secondary hover:text-error transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="rounded-xl bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
