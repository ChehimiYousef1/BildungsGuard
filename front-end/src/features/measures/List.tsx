import React, { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Bar2 } from '../../components/Bar';
import { Badge } from '../../components/Badge';
import { api, getToken } from '../../lib/api';
import { translateText } from '../../lib/translateName';
import BootcampDetail from './Detail';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';
const EMPTY = {
  name: '', number: '', azav: '', status: 'planned',
  capacity: '0', enrolled: '0', ueHours: '0',
  mode: '', startDate: '', endDate: '',
};

export default function Bootcamps() {
  const { t, lang, toast } = useApp();
  const de = lang === 'de';

  const [rows,    setRows]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [sel,     setSel]     = useState<number | null>(null);
  const [open,    setOpen]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [editId,  setEditId]  = useState<string | null>(null);
  const [form,    setForm]    = useState<any>({ ...EMPTY });

  const load = async () => {
    try {
      const data = await api<any[]>('/measures');
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load Bootcamps');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY });
    setFormErr(null);
    setOpen(true);
  };

  const openEdit = (row: any) => {
    setEditId(row.id);
    setForm({
      name:      row.name      ?? '',
      number:    row.number    ?? '',
      azav:      row.azav      ?? '',
      status:    row.status    ?? 'planned',
      capacity:  String(row.capacity  ?? 0),
      enrolled:  String(row.enrolled  ?? 0),
      ueHours:   String(row.ueHours   ?? 0),
      mode:      row.mode      ?? '',
      startDate: row.startDate ?? '',
      endDate:   row.endDate   ?? '',
    });
    setFormErr(null);
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim()) { setFormErr(de ? 'Name ist erforderlich.' : 'Name is required.'); return; }
    setSaving(true);
    setFormErr(null);
    try {
      const payload = {
        name:      form.name.trim(),
        number:    form.number.trim()    || undefined,
        azav:      form.azav.trim()      || undefined,
        status:    form.status,
        capacity:  parseInt(form.capacity)  || 0,
        enrolled:  parseInt(form.enrolled)  || 0,
        ueHours:   parseInt(form.ueHours)   || 0,
        mode:      form.mode.trim()      || undefined,
        startDate: form.startDate.trim() || undefined,
        endDate:   form.endDate.trim()   || undefined,
      };
      if (editId) {
        await api(`/measures/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/measures', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      await load();
      toast.success(editId ? (de ? 'Bootcamp aktualisiert!' : 'Bootcamp updated!') : (de ? 'Bootcamp erstellt!' : 'Bootcamp created!'));
    } catch (e: any) {
      setFormErr(e?.message || (de ? 'Fehler beim Speichern.' : 'Save failed.'));
      toast.error(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Bootcamp löschen?' : 'Delete bootcamp?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/measures/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setSel(null);
      await load();
      toast.success(de ? 'Bootcamp gelöscht.' : 'Bootcamp deleted.');
    } catch (e) {
      console.error(e);
      toast.error(de ? 'Fehler beim Löschen.' : 'Delete failed.');
    }
  };

  // ✅ Translated name — uses local dictionary
  const tName = (name: string) => translateText(name, lang);

  if (sel !== null && rows[sel]) {
    return <BootcampDetail measure={rows[sel]} back={() => setSel(null)} />;
  }

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="card" style={{ marginBottom: 15, padding: '14px 18px' }}>
        <div className="card-head">
          <div>
            <div className="card-title" style={{ fontSize: 16 }}>
              {de ? 'Maßnahmen' : 'Bootcamps'} · {rows.length}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              {de ? 'AZAV-Zulassung, Curriculum, Belegung' : 'AZAV approval, curriculum, enrollment'}
            </div>
          </div>
          <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={openAdd}>
            <Plus size={14} /> {de ? 'Hinzufügen' : 'Add'}
          </button>
        </div>
      </div>

      {loading && <div className="card" style={{ padding: 20, color: C.muted, fontSize: 13 }}>...</div>}
      {error   && <div className="card" style={{ padding: 16, color: C.rose,  fontSize: 13 }}>{error}</div>}

      {/* ===== CARDS GRID ===== */}
      {!loading && rows.length === 0 && (
        <div className="card" style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>
          {de ? 'Keine Bootcamps vorhanden.' : 'No bootcamps found.'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {!loading && rows.map((row, i) => {
          const cap     = Number(row.capacity) || 0;
          const enr     = Number(row.enrolled)  || 0;
          const fillPct = cap > 0 ? Math.min(100, Math.round((enr / cap) * 100)) : 0;

          return (
            <div key={row.id ?? i} className="card"
              style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}
              onClick={() => setSel(i)}>

              {/* Card header */}
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.line}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* ✅ Translated name */}
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 4 }}>
                      {tName(row.name)}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Badge s={row.status} />
                      {row.number && (
                        <span style={{ fontSize: 11.5, color: C.muted }}>Nr. {row.number}</span>
                      )}
                      {row.azav && (
                        <span style={{ fontSize: 11.5, color: C.muted }}>{row.azav}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <button className="icon-mini" onClick={() => openEdit(row)}>
                      <Pencil size={13} color={C.muted} />
                    </button>
                    <button className="icon-mini" onClick={() => remove(row.id)}>
                      <Trash2 size={13} color={C.muted} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginBottom: 12 }}>
                  {[
                    [de ? 'Stunden (UE)' : 'Hours (UE)', row.ueHours ?? '—'],
                    [de ? 'Format'       : 'Format',     row.mode    ?? '—'],
                    [de ? 'Start'        : 'Start',      row.startDate ?? '—'],
                    [de ? 'Ende'         : 'End',        row.endDate   ?? '—'],
                  ].map(([label, val], idx) => (
                    <div key={idx}>
                      <div style={{ fontSize: 10.5, color: C.muted, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Enrollment bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.muted, marginBottom: 4 }}>
                    <span>{de ? 'Belegung' : 'Enrollment'}</span>
                    <span style={{ fontWeight: 700, color: fillPct >= 90 ? C.rose : fillPct >= 70 ? C.amber : C.mint }}>
                      {enr}/{cap}
                    </span>
                  </div>
                  <Bar2 pct={fillPct} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== FORM MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 500, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId ? (de ? 'Bootcamp bearbeiten' : 'Edit bootcamp') : (de ? 'Neues Bootcamp' : 'New bootcamp')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Name *' : 'Name *'}
                <input value={form.name} onChange={(e) => set('name', e.target.value)}
                  style={inp} placeholder="e.g. Data Analytics" autoFocus />
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Maßnahmenummer' : 'Measure number'}
                  <input value={form.number} onChange={(e) => set('number', e.target.value)}
                    style={inp} placeholder="M-2026" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>AZAV
                  <input value={form.azav} onChange={(e) => set('azav', e.target.value)}
                    style={inp} placeholder="AZAV-123" />
                </label>
              </div>

              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inp}>
                  <option value="planned">{de ? 'Geplant'   : 'Planned'}</option>
                  <option value="running">{de ? 'Laufend'   : 'Running'}</option>
                  <option value="finishing">{de ? 'Abschluss' : 'Finishing'}</option>
                  <option value="done">{de ? 'Abgeschlossen' : 'Done'}</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Stunden (UE)' : 'Hours (UE)'}
                  <input value={form.ueHours} onChange={(e) => set('ueHours', e.target.value)}
                    style={inp} placeholder="540" type="number" min="0" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Format' : 'Format'}
                  <select value={form.mode} onChange={(e) => set('mode', e.target.value)} style={inp}>
                    <option value="">{de ? '— Wählen —' : '— Select —'}</option>
                    <option value="Vollzeit">{de ? 'Vollzeit' : 'Full-time'}</option>
                    <option value="Teilzeit">{de ? 'Teilzeit' : 'Part-time'}</option>
                    <option value="Online">{de ? 'Online' : 'Online'}</option>
                    <option value="Hybrid">{de ? 'Hybrid' : 'Hybrid'}</option>
                  </select>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Start' : 'Start'}
                  <input value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
                    style={inp} placeholder="01.07.2026" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Ende' : 'End'}
                  <input value={form.endDate} onChange={(e) => set('endDate', e.target.value)}
                    style={inp} placeholder="30.09.2026" />
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Kapazität' : 'Capacity'}
                  <input value={form.capacity} onChange={(e) => set('capacity', e.target.value)}
                    style={inp} placeholder="20" type="number" min="0" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Belegt' : 'Enrolled'}
                  <input value={form.enrolled} onChange={(e) => set('enrolled', e.target.value)}
                    style={inp} placeholder="15" type="number" min="0" />
                </label>
              </div>

              {formErr && (
                <div style={{ fontSize: 12.5, color: C.rose, padding: '8px 12px', borderRadius: 8, background: C.rose + '10' }}>
                  {formErr}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={saving} onClick={submit}>
                  {saving ? '...' : (editId ? (de ? 'Speichern' : 'Save') : (de ? 'Erstellen' : 'Create'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
};
const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = {
  marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', width: '100%',
};
