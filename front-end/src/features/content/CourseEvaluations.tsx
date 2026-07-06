import React, { useState, useEffect } from 'react';
import { Star, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

const StarRating = ({ value, onChange }: { value: number; onChange?: (v: number) => void }) => (
  <div style={{ display: 'flex', gap: 3 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={16}
        fill={s <= value ? C.amber : 'none'}
        color={s <= value ? C.amber : C.line}
        style={{ cursor: onChange ? 'pointer' : 'default' }}
        onClick={() => onChange?.(s)}
      />
    ))}
  </div>
);

export default function CourseEvaluations({ courseId }: { courseId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    period: '', overallRating: 0, contentRating: 0,
    trainerRating: 0, participantCount: '',
    strengths: '', improvements: '', notes: '',
  });

  const load = async () => {
    try {
      const d = await api<any[]>(`/course-evaluations?courseId=${courseId}`);
      setRows(Array.isArray(d) ? d : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [courseId]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditId(null);
    setForm({ period: '', overallRating: 0, contentRating: 0, trainerRating: 0, participantCount: '', strengths: '', improvements: '', notes: '' });
    setOpen(true);
  };

  const openEdit = (r: any) => {
    setEditId(r.id);
    setForm({
      period: r.period ?? '',
      overallRating: r.overallRating ?? 0,
      contentRating: r.contentRating ?? 0,
      trainerRating: r.trainerRating ?? 0,
      participantCount: String(r.participantCount ?? ''),
      strengths: r.strengths ?? '',
      improvements: r.improvements ?? '',
      notes: r.notes ?? '',
    });
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        courseId,
        period: form.period || undefined,
        overallRating: form.overallRating || undefined,
        contentRating: form.contentRating || undefined,
        trainerRating: form.trainerRating || undefined,
        participantCount: form.participantCount ? Number(form.participantCount) : undefined,
        strengths: form.strengths || undefined,
        improvements: form.improvements || undefined,
        notes: form.notes || undefined,
      };
      if (editId) {
        await api(`/course-evaluations/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/course-evaluations', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      await load();
    } catch (e) { console.error('course eval save failed', e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Bewertung löschen?' : 'Delete evaluation?')) return;
    try {
      await api(`/course-evaluations/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ marginTop: 12, borderTop: `1px dashed ${C.line}`, paddingTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Star size={13} color={C.amber} />
          {de ? 'Maßnahmenbewertungen (#25)' : 'Course evaluations (#25)'} · {rows.length}
        </div>
        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }} onClick={openNew}>
          <Plus size={12} /> {de ? 'Neu' : 'New'}
        </button>
      </div>

      {loading && <div style={{ fontSize: 12, color: C.muted }}>…</div>}

      {!loading && rows.length === 0 && (
        <div style={{ fontSize: 12, color: C.mutedLight }}>
          {de ? 'Noch keine Bewertungen.' : 'No evaluations yet.'}
        </div>
      )}

      {!loading && rows.map((r, i) => (
        <div key={r.id} style={{
          padding: '10px 12px', marginBottom: 8, borderRadius: 10,
          background: C.soft, border: `1px solid ${C.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 12.5 }}>
              {r.period || (de ? `Bewertung ${i + 1}` : `Evaluation ${i + 1}`)}
              {r.participantCount > 0 && (
                <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>
                  {r.participantCount} {de ? 'Teilnehmer' : 'participants'}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="icon-mini" onClick={() => openEdit(r)}><Pencil size={12} color={C.muted} /></button>
              <button className="icon-mini" onClick={() => remove(r.id)}><Trash2 size={12} color={C.muted} /></button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {r.overallRating > 0 && (
              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{de ? 'Gesamt' : 'Overall'}</div>
                <StarRating value={r.overallRating} />
              </div>
            )}
            {r.contentRating > 0 && (
              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{de ? 'Inhalt' : 'Content'}</div>
                <StarRating value={r.contentRating} />
              </div>
            )}
            {r.trainerRating > 0 && (
              <div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{de ? 'Dozent' : 'Trainer'}</div>
                <StarRating value={r.trainerRating} />
              </div>
            )}
          </div>

          {r.strengths && (
            <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 6 }}>
              <span style={{ color: C.mint, fontWeight: 600 }}>+ </span>{r.strengths}
            </div>
          )}
          {r.improvements && (
            <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3 }}>
              <span style={{ color: C.amber, fontWeight: 600 }}>△ </span>{r.improvements}
            </div>
          )}
          {r.notes && (
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3, fontStyle: 'italic' }}>{r.notes}</div>
          )}
        </div>
      ))}

      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId
                  ? (de ? 'Bewertung bearbeiten' : 'Edit evaluation')
                  : (de ? 'Neue Bewertung' : 'New evaluation')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Zeitraum' : 'Period'}
                <input
                  value={form.period}
                  onChange={(e) => set('period', e.target.value)}
                  style={inp}
                  placeholder={de ? 'z.B. Q1 2025 / Jan–Mär 2025' : 'e.g. Q1 2025 / Jan–Mar 2025'}
                />
              </label>

              <label style={lbl}>{de ? 'Teilnehmeranzahl' : 'Participant count'}
                <input
                  type="number" min={0}
                  value={form.participantCount}
                  onChange={(e) => set('participantCount', e.target.value)}
                  style={inp} placeholder="0"
                />
              </label>

              {([
                ['overallRating', de ? 'Gesamtbewertung' : 'Overall rating'],
                ['contentRating', de ? 'Inhaltsbewertung' : 'Content rating'],
                ['trainerRating', de ? 'Dozentenbewertung' : 'Trainer rating'],
              ] as [string, string][]).map(([field, label]) => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: '#334155' }}>{label}</span>
                  <StarRating
                    value={(form as any)[field]}
                    onChange={(v) => set(field, v)}
                  />
                </div>
              ))}

              <label style={lbl}>{de ? 'Stärken' : 'Strengths'}
                <textarea
                  value={form.strengths}
                  onChange={(e) => set('strengths', e.target.value)}
                  style={{ ...inp, minHeight: 55, resize: 'vertical' }}
                />
              </label>

              <label style={lbl}>{de ? 'Verbesserungspotenzial' : 'Areas for improvement'}
                <textarea
                  value={form.improvements}
                  onChange={(e) => set('improvements', e.target.value)}
                  style={{ ...inp, minHeight: 55, resize: 'vertical' }}
                />
              </label>

              <label style={lbl}>{de ? 'Notizen' : 'Notes'}
                <textarea
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  style={{ ...inp, minHeight: 55, resize: 'vertical' }}
                />
              </label>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  className="btn"
                  style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving}
                  onClick={() => setOpen(false)}
                >
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button
                  className="btn btn-primary"
                  style={{ padding: '9px 16px' }}
                  disabled={saving}
                  onClick={submit}
                >
                  {saving ? '…' : (de ? 'Speichern' : 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
};
const lbl: React.CSSProperties = {
  fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column',
};
const inp: React.CSSProperties = {
  width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none',
};