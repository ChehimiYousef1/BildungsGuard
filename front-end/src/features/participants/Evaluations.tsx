import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, Award, Star, ThumbsUp, TrendingUp } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function Evaluations({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ title: '', rating: 0, strengths: '', weaknesses: '', recommendation: '', evalDate: '', author: '' });

 const load = async () => {
    console.log('EVAL participantId:', participantId);
    if (!participantId) { setLoading(false); return; }
    try {
      const data = await api<any[]>(`/evaluations?participantId=${participantId}`);
      console.log('EVAL data received:', data);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { console.error('EVAL load error:', e); setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditId(null); setForm({ title: '', rating: 0, strengths: '', weaknesses: '', recommendation: '', evalDate: new Date().toLocaleDateString('de-DE'), author: '' }); setOpen(true); };
  const openEdit = (r: any) => { setEditId(r.id); setForm({ title: r.title ?? '', rating: r.rating ?? 0, strengths: r.strengths ?? '', weaknesses: r.weaknesses ?? '', recommendation: r.recommendation ?? '', evalDate: r.evalDate ?? '', author: r.author ?? '' }); setOpen(true); };

  const submit = async () => {
    setSaving(true);
    const payload: any = {
      scope: 'participant',
      title: form.title.trim() || undefined,
      rating: form.rating ? Number(form.rating) : undefined,
      strengths: form.strengths.trim() || undefined,
      weaknesses: form.weaknesses.trim() || undefined,
      recommendation: form.recommendation.trim() || undefined,
      evalDate: form.evalDate.trim() || undefined,
      author: form.author.trim() || undefined,
    };
    try {
      if (editId) {
        await api(`/evaluations/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/evaluations', { method: 'POST', body: JSON.stringify({ ...payload, participantId }) });
      }
      setOpen(false);
      setLoading(true);
      await load();
    } catch (e) { console.error('save evaluation failed', e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Diese Bewertung löschen?' : 'Delete this evaluation?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/evaluations/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setLoading(true);
      await load();
    } catch (e) { console.error('delete evaluation failed', e); }
  };

  const stars = (n: number) => (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={13} fill={i <= n ? C.amber : 'none'} color={i <= n ? C.amber : C.lineSoft} />)}
    </span>
  );

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">{de ? 'Gesamtbewertung' : 'Evaluation'} · {rows.length}</div>
        <button className="btn btn-primary" style={{ padding: '7px 13px' }} onClick={openCreate}><Plus size={14} /> {de ? 'Bewertung' : 'Evaluation'}</button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
      {!loading && rows.length === 0 && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>{de ? 'Noch keine Bewertung.' : 'No evaluation yet.'}</div>}

      {!loading && rows.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 4px', borderBottom: `1px solid ${C.lineSoft}` }}>
          <Award size={16} color={C.iris} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{r.title || (de ? 'Gesamtbewertung' : 'Evaluation')}</span>
              {r.rating ? stars(r.rating) : null}
              {r.evalDate && <span className="mono" style={{ fontSize: 11, color: C.muted }}>{r.evalDate}</span>}
            </div>
            {r.strengths && <div style={{ fontSize: 11.5, marginTop: 5, display: 'flex', gap: 6 }}><ThumbsUp size={12} color={C.mint} style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ color: C.inkSoft }}>{r.strengths}</span></div>}
            {r.weaknesses && <div style={{ fontSize: 11.5, marginTop: 4, display: 'flex', gap: 6 }}><TrendingUp size={12} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ color: C.inkSoft }}>{r.weaknesses}</span></div>}
            {r.recommendation && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, fontStyle: 'italic' }}>→ {r.recommendation}</div>}
            {r.author && <div style={{ fontSize: 10.5, color: C.mutedLight, marginTop: 3 }}>— {r.author}</div>}
          </div>
          <button onClick={() => openEdit(r)} style={iconBtn}><Pencil size={13} color={C.muted} /></button>
          <button onClick={() => remove(r.id)} style={iconBtn}><Trash2 size={13} color={C.muted} /></button>
        </div>
      ))}

      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 500, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{editId ? (de ? 'Bewertung bearbeiten' : 'Edit evaluation') : (de ? 'Neue Bewertung' : 'New evaluation')}</div>
              <button onClick={() => !saving && setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Titel' : 'Title'}<input value={form.title} onChange={(e) => set('title', e.target.value)} style={inp} placeholder={de ? 'z.B. Abschlussbewertung' : 'e.g. Final evaluation'} /></label>
                <label style={{ ...lbl, width: 130 }}>{de ? 'Datum' : 'Date'}<input value={form.evalDate} onChange={(e) => set('evalDate', e.target.value)} style={inp} placeholder="TT.MM.JJJJ" /></label>
              </div>

              <label style={lbl}>{de ? 'Gesamtbewertung (1-5)' : 'Overall rating (1-5)'}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} type="button" onClick={() => set('rating', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      <Star size={26} fill={i <= form.rating ? C.amber : 'none'} color={i <= form.rating ? C.amber : C.line} />
                    </button>
                  ))}
                  {form.rating > 0 && <button type="button" onClick={() => set('rating', 0)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 11, marginLeft: 6 }}>{de ? 'löschen' : 'clear'}</button>}
                </div>
              </label>

              <label style={lbl}>{de ? 'Stärken' : 'Strengths'}<textarea value={form.strengths} onChange={(e) => set('strengths', e.target.value)} style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder={de ? 'Was lief gut…' : 'What went well…'} /></label>
              <label style={lbl}>{de ? 'Entwicklungsfelder' : 'Areas for improvement'}<textarea value={form.weaknesses} onChange={(e) => set('weaknesses', e.target.value)} style={{ ...inp, minHeight: 60, resize: 'vertical' }} placeholder={de ? 'Was verbessert werden kann…' : 'What can improve…'} /></label>
              <label style={lbl}>{de ? 'Empfehlung' : 'Recommendation'}<input value={form.recommendation} onChange={(e) => set('recommendation', e.target.value)} style={inp} /></label>
              <label style={lbl}>{de ? 'Verfasser' : 'Author'}<input value={form.author} onChange={(e) => set('author', e.target.value)} style={inp} placeholder={de ? 'Coach/Dozent' : 'Coach/Trainer'} /></label>

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