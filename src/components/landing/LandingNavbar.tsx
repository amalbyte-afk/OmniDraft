import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'Templates', href: '/#templates' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
];

export default function LandingNavbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = useCallback(async () => {
    setMobileOpen(false);
    await signOut();
    navigate('/');
  }, [signOut, navigate]);

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false);
    if (href.startsWith('/#')) {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-glass-border shadow-lg shadow-accent/5'
          : ''
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(14, 10, 10, 0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(24px)' : 'none',
      }}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-6 md:h-[72px] md:px-10" style={{ maxWidth: 1280 }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
            <Sparkles className="h-5 w-5 text-accent" />
          </div>
          <span
            className="text-2xl font-bold tracking-tight text-white md:text-[28px]"
            style={{ fontFamily: 'Equinox, General Sans, sans-serif' }}
          >
            OmniDraft
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => handleNavClick(link.href)}
              className="relative rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-white"
            >
              {link.label}
              <span className="absolute bottom-0 left-1/2 h-[1.5px] w-0 -translate-x-1/2 bg-accent transition-all duration-300 group-hover:w-4/5" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/workspace"
                className="hidden rounded-xl border border-glass-border px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:bg-white/5 hover:text-white md:inline-block"
              >
                Workspace
              </Link>
              <button
                onClick={handleSignOut}
                className="hidden items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover md:inline-flex"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden rounded-xl px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-white md:inline-block"
              >
                Login
              </Link>
              <Link
                to="/auth"
                className="relative overflow-hidden rounded-xl bg-accent px-5 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.97]"
              >
                Launch Workspace
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-white md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-glass-border md:hidden"
            style={{ backgroundColor: 'rgba(14, 10, 10, 0.95)' }}
          >
            <div className="flex flex-col gap-1 px-6 py-5">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="my-3 border-t border-glass-border" />
              {user ? (
                <>
                  <Link
                    to="/workspace"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
                  >
                    Workspace
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-error"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white"
                  >
                    Launch Workspace
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
