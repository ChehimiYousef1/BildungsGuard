import React, { useState, useEffect } from 'react';
import { Plus, X, Check, Pencil, Trash2, UserCheck, Clock } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { OUTCOME_LABELS, CONTRACT_LABELS } from '../../config/docTypes';

export default function PlacementFollowUp({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    month: '0', outcome: '', employer: '', jobTitle: '',
    contractType: '', followUpDate: '', notes: '', consentGiven: false,
  });

  const load = async () => {
    try {
      const d = await api<any[]>(`/placement-follow-up?participantId=${participantId}`);
      setRows(Array.isArray(d) ? d : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditId(null);
    setForm({ month: '0', outcome: '', employer: '', jobTitle: '', contractType: '', followUpDate: '', notes: '', consentGiven: false });
    setOpen(true);
  };

  const openEdit = (r: any) => {
    setEditId(r.id);
    setForm({
      month: String(r.month ?? 0),
      outcome: r.outcome ?? '',
      employer: r.employer ?? '',
      jobTitle: r.jobTitle ?? '',
      contractType: r.contractType ?? '',
      followUpDate: r.followUpDate ?? '',
      notes: r.notes ?? '',
      consentGiven: r.consentGiven ?? false,
    });
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        participantId,
        month: Number(form.month),
        outcome: form.outcome || undefined,
        employer: form.employer || undefined,
        jobTitle: form.jobTitle || undefined,
        contractType: form.contractType || undefined,
        followUpDate: form.followUpDate || undefined,
        notes: form.notes || undefined,
        consentGiven: form.consentGiven,
      };
      if (editId) {
        await api(`/placement-follow-up/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/placement-follow-up', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      await load();
    } catch (e) { console.error('placement save failed', e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Verbleib löschen?' : 'Delete placement?')) return;
    try {
      await api(`/placement-follow-up/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) { console.error(e); }
  };

  const outcomeLabel = (v: string) => OUTCOME_LABELS[v]?.[lang] ?? v;
  const contractLabel = (v: string) => CONTRACT_LABELS[v]?.[lang] ?? v;

  const monthLabel = (m: number) => m === 0
    ? (de ? 'Bei Abschluss' : 'At completion')
    : (de ? `Nach ${m} Monaten` : `After ${m} months`);

  return (
    <div className="card" style={{ marginTop: 15 }}>
      <div className="card-head">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserCheck size={15} color={C.iris} />
          {de ? 'Verbleib & Eingliederung' : 'Placement & Follow-up'} · {rows.length}
        </div>
        <button className="btn btn-primary" style={{ padding: '7px 13px', fontSize: 12 }} onClick={openNew}>
          <Plus size={13} /> {de ? 'Neu' : 'New'}
        </button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
      {!loading && rows.length === 0 && (
        <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>
          {de ? 'Noch kein Verbleib erfasst.' : 'No placement recorded yet.'}
        </div>
      )}

      {!loading && rows.map((r, i) => (
        <div key={r.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0',
          borderBottom: i < rows.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: r.month === 0 ? C.iris + '18' : C.mint + '18',
            display: 'grid', placeItems: 'center',
          }}>
            {r.month === 0 ? <UserCheck size={17} color={C.iris} /> : <Clock size={17} color={C.mint} />}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>
              {monthLabel(r.month)}
              {r.outcome && (
                <span className="badge" style={{
                  marginLeft: 8,
                  background: r.outcome === 'employed' ? C.mint + '18' : C.amber + '18',
                  color: r.outcome === 'employed' ? C.mint : C.amber,
                }}>
                  {outcomeLabel(r.outcome)}
                </span>
              )}
            </div>
            {r.employer && <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{r.employer} {r.jobTitle ? `· ${r.jobTitle}` : ''}</div>}
            {r.contractType && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{contractLabel(r.contractType)}</div>}
            {r.followUpDate && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{de ? 'Datum:' : 'Date:'} {r.followUpDate}</div>}
            {r.notes && <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, fontStyle: 'italic' }}>{r.notes}</div>}
            {r.consentGiven && (
              <span style={{ fontSize: 11, color: C.mint, display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
                <Check size={11} /> {de ? 'Einwilligung erteilt' : 'Consent given'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button className="icon-mini" onClick={() => openEdit(r)}><Pencil size={13} color={C.muted} /></button>
            <button className="icon-mini" onClick={() => remove(r.id)}><Trash2 size={13} color={C.muted} /></button>
          </div>
        </div>
      ))}

      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId ? (de ? 'Verbleib bearbeiten' : 'Edit placement') : (de ? 'Verbleib erfassen' : 'Record placement')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Zeitpunkt' : 'Timepoint'}
                <select value={form.month} onChange={(e) => set('month', e.target.value)} style={inp}>
                  <option value="0">{de ? 'Bei Abschluss (Monat 0)' : 'At completion (month 0)'}</option>
                  <option value="6">{de ? 'Nach 6 Monaten' : 'After 6 months'}</option>
                  <option value="12">{de ? 'Nach 12 Monaten' : 'After 12 months'}</option>
                </select>
              </label>

              <label style={lbl}>{de ? 'Verbleib / Outcome' : 'Outcome'}
                <select value={form.outcome} onChange={(e) => set('outcome', e.target.value)} style={inp}>
                  <option value="">—</option>
                  <option value="employed">{de ? 'In Beschäftigung' : 'Employed'}</option>
                  <option value="job_seeking">{de ? 'Arbeitssuchend' : 'Job-seeking'}</option>
                  <option value="education">{de ? 'In Ausbildung' : 'In education'}</option>
                  <option value="training">{de ? 'In Weiterbildung' : 'In training'}</option>
                  <option value="other">{de ? 'Sonstiges' : 'Other'}</option>
                </select>
              </label>

              <label style={lbl}>{de ? 'Arbeitgeber' : 'Employer'}
                <input value={form.employer} onChange={(e) => set('employer', e.target.value)} style={inp} placeholder={de ? 'Firma GmbH…' : 'Company Ltd…'} />
              </label>

              <label style={lbl}>{de ? 'Berufsbezeichnung' : 'Job title'}
                <input value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} style={inp} placeholder={de ? 'z.B. Data Analyst' : 'e.g. Data Analyst'} />
              </label>

              <label style={lbl}>{de ? 'Vertragsart' : 'Contract type'}
                <select value={form.contractType} onChange={(e) => set('contractType', e.target.value)} style={inp}>
                  <option value="">—</option>
                  <option value="permanent">{de ? 'Unbefristet' : 'Permanent'}</option>
                  <option value="temporary">{de ? 'Befristet' : 'Temporary'}</option>
                  <option value="freelance">{de ? 'Freiberuflich' : 'Freelance'}</option>
                </select>
              </label>

              <label style={lbl}>{de ? 'Datum' : 'Follow-up date'}
                <input value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} style={inp} placeholder="31.12.2025" />
              </label>

              <label style={lbl}>{de ? 'Notizen' : 'Notes'}
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.consentGiven} onChange={(e) => set('consentGiven', e.target.checked)} />
                {de ? 'Einwilligung zur Kontaktaufnahme erteilt' : 'Consent to contact given'}
              </label>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }} disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }} disabled={saving} onClick={submit}>
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
const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = {
  width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none',
};