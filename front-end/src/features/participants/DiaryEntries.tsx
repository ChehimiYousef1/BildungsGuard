import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, Briefcase } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

// حالات التقديم
const STATUSES: { id: string; de: string; en: string; col: string }[] = [
  { id: 'applied', de: 'Beworben', en: 'Applied', col: C.iris },
  { id: 'interview', de: 'Vorstellungsgespräch', en: 'Interview', col: C.amber },
  { id: 'rejected', de: 'Absage', en: 'Rejected', col: C.rose },
  { id: 'offer', de: 'Zusage', en: 'Offer', col: C.mint },
];

export default function DiaryEntries({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ entryDate: '', company: '', position: '', method: '', status: 'applied', notes: '' });

  const statusInfo = (id: string) => STATUSES.find((s) => s.id === id) ?? STATUSES[0];

  const load = async () => {
    if (!participantId) { setLoading(false); return; }
    try {
 const data = await api<any[]>(`/diary-entries?participantId=${participantId}`);
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditId(null); setForm({ entryDate: new Date().toLocaleDateString('de-DE'), company: '', position: '', method: '', status: 'applied', notes: '' }); setOpen(true); };
  const openEdit = (r: any) => { setEditId(r.id); setForm({ entryDate: r.entryDate ?? '', company: r.company ?? '', position: r.position ?? '', method: r.method ?? '', status: r.status ?? 'applied', notes: r.notes ?? '' }); setOpen(true); };

  const submit = async () => {
    setSaving(true);
    const payload: any = {
      entryDate: form.entryDate.trim() || undefined,
      company: form.company.trim() || undefined,
      position: form.position.trim() || undefined,
      method: form.method.trim() || undefined,
      status: form.status,
      notes: form.notes.trim() || undefined,
    };
    try {
      if (editId) {
        await api(`/diary-entries/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/diary-entries', { method: 'POST', body: JSON.stringify({ ...payload, participantId }) });
      }
      setOpen(false);
      setLoading(true);
      await load();
    } catch (e) { console.error('save diary failed', e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Diesen Eintrag löschen?' : 'Delete this entry?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/diary-entries/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setLoading(true);
      await load();
    } catch (e) { console.error('delete diary failed', e); }
  };

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">{de ? 'Bewerbungstagebuch' : 'Job application diary'} · {rows.length}</div>
        <button className="btn btn-primary" style={{ padding: '7px 13px' }} onClick={openCreate}><Plus size={14} /> {de ? 'Bewerbung' : 'Application'}</button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
      {!loading && rows.length === 0 && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>{de ? 'Noch keine Bewerbungen.' : 'No applications yet.'}</div>}

      {!loading && rows.length > 0 && (
        <div className="scroll-x"><table>
          <thead><tr>
            <th>{de ? 'Datum' : 'Date'}</th>
            <th>{de ? 'Firma' : 'Company'}</th>
            <th className="hide-mobile">{de ? 'Position' : 'Position'}</th>
            <th className="hide-mobile">{de ? 'Weg' : 'Method'}</th>
            <th>{de ? 'Status' : 'Status'}</th>
            <th></th>
          </tr></thead>
          <tbody>{rows.map((r) => {
            const si = statusInfo(r.status);
            return (
              <tr key={r.id} className="row">
                <td className="mono" style={{ color: C.muted }}>{r.entryDate ?? '—'}</td>
                <td><div className="cell-name">{r.company ?? '—'}</div>{r.notes && <div className="cell-sub">{r.notes}</div>}</td>
                <td className="hide-mobile">{r.position ?? '—'}</td>
                <td className="hide-mobile">{r.method ?? '—'}</td>
                <td><span className="badge" style={{ background: si.col + '22', color: si.col }}>{de ? si.de : si.en}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                    <button onClick={() => openEdit(r)} style={iconBtn}><Pencil size={13} color={C.muted} /></button>
                    <button onClick={() => remove(r.id)} style={iconBtn}><Trash2 size={13} color={C.muted} /></button>
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}

      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 480, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{editId ? (de ? 'Bewerbung bearbeiten' : 'Edit application') : (de ? 'Neue Bewerbung' : 'New application')}</div>
              <button onClick={() => !saving && setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Datum' : 'Date'}<input value={form.entryDate} onChange={(e) => set('entryDate', e.target.value)} style={inp} placeholder="TT.MM.JJJJ" /></label>
                <label style={{ ...lbl, flex: 1 }}>Status
                  <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inp}>
                    {STATUSES.map((s) => <option key={s.id} value={s.id}>{de ? s.de : s.en}</option>)}
                  </select>
                </label>
              </div>
              <label style={lbl}>{de ? 'Firma' : 'Company'}<input value={form.company} onChange={(e) => set('company', e.target.value)} style={inp} placeholder={de ? 'z.B. Siemens AG' : 'e.g. Siemens AG'} /></label>
              <label style={lbl}>{de ? 'Position' : 'Position'}<input value={form.position} onChange={(e) => set('position', e.target.value)} style={inp} /></label>
              <label style={lbl}>{de ? 'Bewerbungsweg' : 'Application method'}<input value={form.method} onChange={(e) => set('method', e.target.value)} style={inp} placeholder={de ? 'Online / E-Mail / Telefon' : 'Online / Email / Phone'} /></label>
              <label style={lbl}>{de ? 'Notizen' : 'Notes'}<textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} style={{ ...inp, minHeight: 70, resize: 'vertical' }} /></label>
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