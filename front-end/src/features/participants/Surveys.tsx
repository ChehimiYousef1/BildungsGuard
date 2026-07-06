import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, ClipboardList, Star } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const TYPES: { id: string; de: string; en: string }[] = [
  { id: 'satisfaction', de: 'Zufriedenheitsbefragung', en: 'Satisfaction survey' },
  { id: 'test', de: 'Test / Prüfung', en: 'Test / exam' },
  { id: 'feedback', de: 'Feedback', en: 'Feedback' },
];

export default function Surveys({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  // scoreGot = النتيجة المحقّقة، scoreMax = من أصل
  const [form, setForm] = useState<any>({ type: 'satisfaction', title: '', rating: 0, scoreGot: '', scoreMax: '', notes: '', surveyDate: '' });
  const [err, setErr] = useState('');

  const typeLabel = (id: string) => { const t = TYPES.find((x) => x.id === id); return t ? (de ? t.de : t.en) : id; };

  const load = async () => {
    if (!participantId) { setLoading(false); return; }
    try {
      const data = await api<any[]>(`/surveys?participantId=${participantId}`);
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const set = (k: string, v: any) => { setForm((f: any) => ({ ...f, [k]: v })); setErr(''); };

  // فكّ "12/15" إلى حقلين عند التعديل
  const parseScore = (score?: string) => {
    if (!score) return { got: '', max: '' };
    const m = score.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (m) return { got: m[1], max: m[2] };
    return { got: '', max: '' };
  };

  const openCreate = () => { setEditId(null); setErr(''); setForm({ type: 'satisfaction', title: '', rating: 0, scoreGot: '', scoreMax: '', notes: '', surveyDate: new Date().toLocaleDateString('de-DE') }); setOpen(true); };
  const openEdit = (r: any) => {
    setEditId(r.id); setErr('');
    const ps = parseScore(r.score);
    setForm({ type: r.type ?? 'satisfaction', title: r.title ?? '', rating: r.rating ?? 0, scoreGot: ps.got, scoreMax: ps.max, notes: r.notes ?? '', surveyDate: r.surveyDate ?? '' });
    setOpen(true);
  };

  // النسبة المحسوبة للعرض
  const pct = (score?: string) => {
    const ps = parseScore(score);
    if (!ps.got || !ps.max) return null;
    const g = Number(ps.got), m = Number(ps.max);
    if (!m) return null;
    return Math.round((g / m) * 100);
  };

  const submit = async () => {
    // تحقّق النتيجة: البسط ≤ المقام، وكلاهما ≥ 0
    let scoreStr: string | undefined;
    const got = form.scoreGot.trim(), max = form.scoreMax.trim();
    if (got || max) {
      if (!got || !max) { setErr(de ? 'Bitte beide Felder (Punkte und von) ausfüllen.' : 'Please fill both score fields.'); return; }
      const g = Number(got), m = Number(max);
      if (isNaN(g) || isNaN(m) || g < 0 || m <= 0) { setErr(de ? 'Ungültige Zahlen.' : 'Invalid numbers.'); return; }
      if (g > m) { setErr(de ? 'Die erreichte Punktzahl darf die Maximalpunktzahl nicht überschreiten.' : 'Score cannot exceed the maximum.'); return; }
      scoreStr = `${g}/${m}`;
    }

    setSaving(true);
    const payload: any = {
      type: form.type,
      title: form.title.trim() || undefined,
      rating: form.rating ? Number(form.rating) : undefined,
      maxRating: 5,
      score: scoreStr,
      notes: form.notes.trim() || undefined,
      surveyDate: form.surveyDate.trim() || undefined,
    };
    try {
      if (editId) {
        await api(`/surveys/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/surveys', { method: 'POST', body: JSON.stringify({ ...payload, participantId }) });
      }
      setOpen(false);
      setLoading(true);
      await load();
    } catch (e) { console.error('save survey failed', e); setErr(de ? 'Speichern fehlgeschlagen.' : 'Save failed.'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Diesen Eintrag löschen?' : 'Delete this entry?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/surveys/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setLoading(true);
      await load();
    } catch (e) { console.error('delete survey failed', e); }
  };

  const stars = (n: number) => (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={13} fill={i <= n ? C.amber : 'none'} color={i <= n ? C.amber : C.lineSoft} />)}
    </span>
  );

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">{de ? 'Befragungen & Tests' : 'Surveys & tests'} · {rows.length}</div>
        <button className="btn btn-primary" style={{ padding: '7px 13px' }} onClick={openCreate}><Plus size={14} /> {de ? 'Eintrag' : 'Entry'}</button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
      {!loading && rows.length === 0 && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>{de ? 'Noch keine Einträge.' : 'No entries yet.'}</div>}

      {!loading && rows.map((r) => {
        const p = pct(r.score);
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 4px', borderBottom: `1px solid ${C.lineSoft}` }}>
            <ClipboardList size={15} color={C.iris} style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, fontSize: 12.5 }}>{typeLabel(r.type)}</span>
                {r.rating ? stars(r.rating) : null}
                {r.score && <span className="badge" style={{ background: C.mint + '22', color: C.mint }}>{r.score}{p !== null ? ` · ${p}%` : ''}</span>}
                {r.surveyDate && <span className="mono" style={{ fontSize: 11, color: C.muted }}>{r.surveyDate}</span>}
              </div>
              {r.title && <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{r.title}</div>}
              {r.notes && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{r.notes}</div>}
            </div>
            <button onClick={() => openEdit(r)} style={iconBtn}><Pencil size={13} color={C.muted} /></button>
            <button onClick={() => remove(r.id)} style={iconBtn}><Trash2 size={13} color={C.muted} /></button>
          </div>
        );
      })}

      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 480, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{editId ? (de ? 'Eintrag bearbeiten' : 'Edit entry') : (de ? 'Neuer Eintrag' : 'New entry')}</div>
              <button onClick={() => !saving && setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Typ' : 'Type'}
                  <select value={form.type} onChange={(e) => set('type', e.target.value)} style={inp}>
                    {TYPES.map((tp) => <option key={tp.id} value={tp.id}>{de ? tp.de : tp.en}</option>)}
                  </select>
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Datum' : 'Date'}<input value={form.surveyDate} onChange={(e) => set('surveyDate', e.target.value)} style={inp} placeholder="TT.MM.JJJJ" /></label>
              </div>
              <label style={lbl}>{de ? 'Titel' : 'Title'}<input value={form.title} onChange={(e) => set('title', e.target.value)} style={inp} placeholder={de ? 'z.B. Abschlussbefragung Modul 3' : 'e.g. Module 3 final survey'} /></label>

              <label style={lbl}>{de ? 'Bewertung (1-5)' : 'Rating (1-5)'}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} type="button" onClick={() => set('rating', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <Star size={26} fill={i <= form.rating ? C.amber : 'none'} color={i <= form.rating ? C.amber : C.line} />
                    </button>
                  ))}
                  {form.rating > 0 && <button type="button" onClick={() => set('rating', 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 11, marginLeft: 6 }}>{de ? 'löschen' : 'clear'}</button>}
                </div>
              </label>

              {/* النتيجة: من أصل — يمنع التجاوز */}
              <div style={lbl as any}>{de ? 'Ergebnis (für Tests)' : 'Score (for tests)'}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <input type="number" min={0} value={form.scoreGot} onChange={(e) => set('scoreGot', e.target.value)} style={{ ...inp, marginTop: 0, width: 90 }} placeholder={de ? 'Punkte' : 'Score'} />
                  <span style={{ color: C.muted, fontWeight: 600 }}>/</span>
                  <input type="number" min={1} value={form.scoreMax} onChange={(e) => set('scoreMax', e.target.value)} style={{ ...inp, marginTop: 0, width: 90 }} placeholder={de ? 'von' : 'of'} />
                  {form.scoreGot && form.scoreMax && Number(form.scoreMax) > 0 && Number(form.scoreGot) <= Number(form.scoreMax) && (
                    <span className="badge" style={{ background: C.iris + '18', color: C.iris }}>{Math.round((Number(form.scoreGot) / Number(form.scoreMax)) * 100)}%</span>
                  )}
                </div>
              </div>

              <label style={lbl}>{de ? 'Notizen' : 'Notes'}<textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} style={{ ...inp, minHeight: 80, resize: 'vertical' }} /></label>

              {err && <div style={{ fontSize: 12, color: C.rose, background: C.rose + '14', borderRadius: 8, padding: '8px 10px' }}>{err}</div>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }} disabled={saving} onClick={() => setOpen(false)}>{de ? 'Abbrechen' : 'Cancel'}</button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }} disabled={saving} onClick={submit}>{saving ? '…' : (de ? 'Speichern' : 'Save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 };
const lbl: React.CSSProperties = { fontSize: 12.5, color: C.inkSoft, display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = { width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none' };
const iconBtn: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: 3, display: 'grid', placeItems: 'center' };