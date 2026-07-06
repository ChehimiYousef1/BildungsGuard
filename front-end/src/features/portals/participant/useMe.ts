import { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../lib/api';

export function useMe() {
  const { user } = useApp();
  const [me, setMe]           = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list  = await api<any[]>('/participants');
        const parts = Array.isArray(list) ? list : [];

        const email    = (user?.email    || '').toLowerCase().trim();
        const username = (user?.username || '').toLowerCase().trim();
        const userId   = user?.id;
        const userName = (user?.name    || '').toLowerCase().trim();

        const found =
          parts.find((p) => p.user?.id && p.user.id === userId) ??
          (email ? parts.find((p) => (p.contact  || '').toLowerCase().trim() === email) : null) ??
          (email ? parts.find((p) => (p.email    || '').toLowerCase().trim() === email) : null) ??
          (email ? parts.find((p) => (p.user?.email || '').toLowerCase().trim() === email) : null) ??
          (username ? parts.find((p) =>
            (p.user?.username || '').toLowerCase().trim() === username ||
            (p.contact        || '').toLowerCase().trim() === username
          ) : null) ??
          (userName ? parts.find((p) => (p.name || '').toLowerCase().trim() === userName) : null) ??
          null;

        console.log('[useMe] user:', user?.email, user?.name,
          '| found:', found?.name, found?.id,
          '| measureId:', found?.measureId ?? found?.measure?.id);

        setMe(found ?? null);
      } catch { setMe(null); }
      finally { setLoading(false); }
    })();
  }, [user?.email, user?.id]);

  return { me, loading };
}
