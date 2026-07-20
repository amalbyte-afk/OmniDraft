import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authCallback } from '../lib/api';
import { useStore } from '../store';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useStore();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const u = data.session?.user ?? null;
      setUser(u);
      if (u?.email) authCallback(u.id, u.email);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u?.email) authCallback(u.id, u.email);
        setLoading(false);
      },
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    showToast('Signed out successfully', 'success');
  };

  return { user, loading, signOut };
}
