import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck, CheckCircle2, AlertTriangle, X,
  Clock, Plus, Pencil, Trash2
} from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function AttendanceRecord({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [records,  setRecords]  = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [open,     setOpen]     = useState(false);
  const [saving,   setSaving]   = useState(false);

  const [form, setForm] = useState({
    sessionId: '',
    present:   true,
    status:    'present',
  });

  const load = async () => {
    try {
      const [att, sess] = await Promise.all([
        api<any[]>(`/attendance/participant/${participantId}`).catch(() => []),
        api<any[]>('/sessions').catch(() => []),
      ]);
      setRecords(Array.isArray(att) ? att : []);
      setSessions(Array.isArray(sess) ? sess : []);
    } catch { setRecords([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const present = records.filter((r) => r.present || r.status === 'present').length;
  const excused = records.filter((r) => r.status === 'excused').length;
  const absent  = records.length - present - excused;
  const total   = records.length;
  const attRate = total > 0 ? Math.round((present / total) * 100) : null;

  const openAdd = () => {
    setForm({ sessionId: sessions[0]?.id ?? '', present: true, status: 'present' });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.sessionId) return;
    setSaving(true);
    try {
      // استخدم endpoint الـ submit الموجود في الـ backend
      await api(`/attendance/${form.sessionId}`, {
        method: 'POST',
        body: JSON.stringify({
          entries: [{
            participantId,
            present: form.status === 'present',
            status:  form.status,
          }],
        }),
      });
      setOpen(false);
      await load();
    } catch (e) {
      console.error('Attendance save failed', e);
      alert(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setSaving(false); }
  };

  const remove = async (sessionId: string) => {
    if (!confirm(de ? 'Eintrag löschen?' : 'Delete entry?')) return;
    try {
      const token = getToken();
      await fetch(`${API}/attendance/${sessionId}/${participantId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await load();
    } catch (e) { console.error(e); }
  };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const visible = expanded ? records : records.slice(0, 5);

  return (
    <div className="card" style={{ marginTop: 15 }}>
      <div className="card-head">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ClipboardCheck size={15} color={C.iris} />
          {de ? 'Anwesenheitsnachweis (#5)' : 'Attendance record (#5)'} · {total}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {attRate !== null && (
            <span className="badge" style={{
              background: attRate >= 80 ? C.mint + '18' : attRate >= 60 ? C.amber + '18' : C.rose + '18',
              color:      attRate >= 80 ? C.mint : attRate >= 60 ? C.amber : C.rose,
            }}>
              {attRate}%
            </span>
          )}
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}
            onClick={openAdd}>
            <Plus size={13} /> {de ? 'Hinzufügen' : 'Add'}
          </button>
        </div>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}

      {!loading && total === 0 && (
        <div style={{ padding: 14 }}>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 10 }}>
            {de ? 'Noch keine Anwesenheitsdaten.' : 'No attendance data yet.'}
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 9, background: C.iris + '08', border: `1px solid ${C.iris}`, fontSize: 12.5, color: C.iris }}>
            💡 {de
              ? 'Anwesenheit wird automatisch beim Sitzungscheck erfasst (Administration → Anwesenheit → Session) oder kann hier manuell hinzugefügt werden.'
              : 'Attendance is recorded automatically during session check (Administration → Attendance → Session) or can be added manually here.'}
          </div>
        </div>
      )}

      {!loading && total > 0 && (
        <>
          {/* Summary badges */}
          <div style={{ display: 'flex', gap: 10, padding: '4px 0 14px', flexWrap: 'wrap' }}>
            {[
              [de ? 'Anwesend'     : 'Present',  present, C.mint],
              [de ? 'Entschuldigt' : 'Excused',  excused, C.amber],
              [de ? 'Abwesend'     : 'Absent',   absent,  C.rose],
            ].map(([label, val, col]: any, i) => (
              <span key={i} className="badge" style={{ background: col + '18', color: col }}>
                {val} {label}
              </span>
            ))}
          </div>

          {/* Progress bar */}
          {attRate !== null && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ height: 6, borderRadius: 3, background: C.line, overflow: 'hidden' }}>
                <div style={{
                  height: 6, borderRadius: 3, width: `${attRate}%`,
                  background: attRate >= 80 ? C.mint : attRate >= 60 ? C.amber : C.rose,
                }} />
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                {present}/{total} {de ? 'Sitzungen anwesend' : 'sessions attended'}
              </div>
            </div>
          )}

          {/* Records list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {visible.map((r, i) => {
              const isPresent = r.present || r.status === 'present';
              const isExcused = r.status === 'excused';
              const color     = isPresent ? C.mint : isExcused ? C.amber : C.rose;
              const label     = isPresent ? (de ? 'Anwesend' : 'Present')
                              : isExcused ? (de ? 'Entschuldigt' : 'Excused')
                              : (de ? 'Abwesend' : 'Absent');
              return (
                <div key={r.id ?? i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  borderRadius: 8, background: color + '06', border: `1px solid ${color}22`,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: color + '18', display: 'grid', placeItems: 'center', flexShrink: 0,
                  }}>
                    {isPresent
                      ? <CheckCircle2 size={14} color={C.mint} />
                      : isExcused
                        ? <AlertTriangle size={13} color={C.amber} />
                        : <X size={13} color={C.rose} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>
                      {r.session?.title ?? `${de ? 'Sitzung' : 'Session'} ${i + 1}`}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {r.session?.course?.name && <span>{r.session.course.name}</span>}
                      {r.session?.time && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={10} /> {r.session.time}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="badge" style={{ background: color + '18', color, fontSize: 11 }}>{label}</span>
                </div>
              );
            })}
          </div>

          {total > 5 && (
            <button onClick={() => setExpanded(!expanded)} style={{
              marginTop: 10, width: '100%', padding: '8px', borderRadius: 8,
              border: `1px solid ${C.line}`, background: C.soft, cursor: 'pointer',
              fontSize: 12.5, color: C.inkSoft,
            }}>
              {expanded
                ? (de ? '▲ Weniger anzeigen' : '▲ Show less')
                : (de ? `▼ Alle ${total} Einträge anzeigen` : `▼ Show all ${total} entries`)}
            </button>
          )}
        </>
      )}

      {/* ===== ADD MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 420, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {de ? 'Anwesenheit eintragen' : 'Add attendance'}
              </div>
              <button onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Sitzung' : 'Session'}
                <select value={form.sessionId} onChange={(e) => set('sessionId', e.target.value)} style={inp}>
                  <option value="">— {de ? 'Sitzung wählen' : 'Select session'} —</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title ?? `${de ? 'Sitzung' : 'Session'} ${s.order ?? ''}`}
                      {s.course?.name ? ` · ${s.course.name}` : ''}
                    </option>
                  ))}
                </select>
                {sessions.length === 0 && (
                  <div style={{ fontSize: 11, color: C.amber, marginTop: 4 }}>
                    ⚠️ {de
                      ? 'Keine Sitzungen gefunden. Bitte erst Sitzungen in Administration → Anwesenheit erstellen.'
                      : 'No sessions found. Please create sessions in Administration → Attendance first.'}
                  </div>
                )}
              </label>

              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  style={inp}
                >
                  <option value="present">{de ? 'Anwesend ✅' : 'Present ✅'}</option>
                  <option value="excused">{de ? 'Entschuldigt ⚠️' : 'Excused ⚠️'}</option>
                  <option value="absent">{de ? 'Abwesend ❌' : 'Absent ❌'}</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={saving || !form.sessionId} onClick={submit}>
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