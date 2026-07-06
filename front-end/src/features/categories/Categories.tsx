import React, { useState, useEffect } from 'react';
import { Plus, X, Tags } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { CAT_GROUPS } from '../../config/categories';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function Categories() {
  const { t } = useApp();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api<any[]>('/categories');
      setCats(Array.isArray(data) ? data : []);
    } catch { setCats([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (id: string, v: string) => setDraft((d) => ({ ...d, [id]: v }));

  const submit = async (groupId: string) => {
    const v = (draft[groupId] || '').trim();
    if (!v) return;
    setBusy(groupId);
    try {
      await api('/categories', { method: 'POST', body: JSON.stringify({ groupId, name: v }) });
      set(groupId, '');
      await load();
    } catch (e) { console.error('add category failed', e); }
    finally { setBusy(null); }
  };

  const remove = async (id: string) => {
    try {
      const token = getToken();
      await fetch(`${API}/categories/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      await load();
    } catch (e) { console.error('remove category failed', e); }
  };

  // فلترة حسب المجموعة
  const inGroup = (groupId: string) => cats.filter((c) => c.groupId === groupId);

  return (
    <>
      <div className="card" style={{ marginBottom: 15, display: 'flex', gap: 11, alignItems: 'center', background: C.soft, fontSize: 12.5, color: C.inkSoft }}><Tags size={17} color={C.iris} style={{ flexShrink: 0 }} /> {t('cat_intro')}</div>
      <div className="set-grid">
        {CAT_GROUPS.map((g) => {
          const items = inGroup(g.id);
          return (
            <div key={g.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 15 }}>
                <div className="chan-ic" style={{ width: 36, height: 36, background: g.col + '22', color: g.col }}><g.ic size={18} /></div>
                <div><div className="set-section-t" style={{ marginBottom: 0 }}>{t(g.tk)}</div><div style={{ fontSize: 11.5, color: C.muted }}>{t(g.sk)}</div></div>
              </div>
              <div className="cat-chips">
                {loading && <span style={{ fontSize: 12, color: C.mutedLight }}>…</span>}
                {!loading && items.map((c) => (
                  <span key={c.id} className="cat-chip"><span style={{ width: 7, height: 7, borderRadius: 50, background: g.col }} /> {c.name}
                    <button onClick={() => remove(c.id)} aria-label="remove"><X size={13} /></button></span>
                ))}
                {!loading && items.length === 0 && <span style={{ fontSize: 12, color: C.mutedLight }}>—</span>}
              </div>
              <div className="cat-add">
                <input className="input" style={{ flex: 1 }} placeholder={t('cat_add_ph')} value={draft[g.id] || ''} onChange={(e) => set(g.id, e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(g.id); }} />
                <button className="btn btn-primary" style={{ padding: '9px 14px' }} disabled={busy === g.id} onClick={() => submit(g.id)}><Plus size={15} /> {busy === g.id ? '…' : t('add')}</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}