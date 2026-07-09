import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { ArrowLeft, ShieldCheck, MapPin, Check, Download } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { api } from '../../lib/api';

const COLORS = ['#6D5DF6', '#8B5CF6', '#3B82F6', '#F59E0B', '#F4475F', '#0FB6A0'];

export default function AttGrid({ session, back }: { session: any; back: () => void }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [people,  setPeople]  = useState<any[]>([]);
  const [states,  setStates]  = useState<Record<string, 'p' | 'e' | 'a'>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  // ===== Load participants =====
  useEffect(() => {
    if (!session?.id) { setLoading(false); return; }
    (async () => {
      try {
        const [parts, existing] = await Promise.all([
          api<any[]>('/participants').catch(() => []),
          api<any[]>(`/attendance/${session.id}`).catch(() => []),
        ]);

        const list = Array.isArray(parts) ? parts : [];
        setPeople(list);

        // Pre-fill existing attendance
        const init: Record<string, 'p' | 'e' | 'a'> = {};
        list.forEach((p: any) => { init[p.id] = 'a'; });
        if (Array.isArray(existing)) {
          existing.forEach((a: any) => {
            const pid = a.participantId ?? a.participant?.id;
            if (!pid) return;
            if (a.status === 'present')  { init[pid] = 'p'; return; }
            if (a.status === 'excused')  { init[pid] = 'e'; return; }
            if (a.status === 'absent')   { init[pid] = 'a'; return; }
            if (a.present === true)      { init[pid] = 'p'; return; }
            if (a.present === false)     { init[pid] = 'a'; return; }
          });
        }
        setStates(init);
      } catch (e) { console.error('AttGrid load failed', e); }
      finally { setLoading(false); }
    })();
  }, [session?.id]);

  const toggle = (id: string) => {
    setStates((s) => {
      const cur = s[id] ?? 'a';
      const next = cur === 'a' ? 'p' : cur === 'p' ? 'e' : 'a';
      return { ...s, [id]: next };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api(`/attendance/${session.id}`, {
        method: 'POST',
        body: JSON.stringify({
          entries: Object.entries(states).map(([participantId, status]) => ({
            participantId,
            status:  status === 'p' ? 'present' : status === 'e' ? 'excused' : 'absent',
            present: status === 'p',
          })),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error('save attendance failed', e); }
    finally { setSaving(false); }
  };

  const present  = Object.values(states).filter((s) => s === 'p').length;
  const excused  = Object.values(states).filter((s) => s === 'e').length;
  const absent   = Object.values(states).filter((s) => s === 'a').length;
  const total    = people.length;
  const pct      = total > 0 ? Math.round((present / total) * 100) : 0;


  // ===== EXPORT EXCEL =====
  const exportExcel = () => {
    const data = people.map((p: any) => {
      const st = states[p.id] ?? 'a';
      return {
        [de ? 'Name'         : 'Name']:    p.name ?? '',
        [de ? 'Kontakt'      : 'Contact']: p.contact ?? p.email ?? '',
        [de ? 'Anwesenheit'  : 'Status']:  st === 'p' ? (de ? 'Anwesend'     : 'Present')
                                         : st === 'e' ? (de ? 'Entschuldigt'  : 'Excused')
                                         :               (de ? 'Abwesend'      : 'Absent'),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, de ? 'Anwesenheit' : 'Attendance');
    ws['!cols'] = [{ wch: 25 }, { wch: 28 }, { wch: 15 }];

    const sessionTitle = (session.title ?? 'session').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `attendance_${sessionTitle}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ===== HEADER ===== */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button
            onClick={back}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: C.muted, fontSize: 13 }}>
            <ArrowLeft size={16} /> {de ? 'Zurück' : 'Back'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: C.iris, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <ShieldCheck size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>
              {session.title || (de ? 'Sitzung' : 'Session')}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {session.time && <span>🕐 {session.time}</span>}
              {session.room && <span><MapPin size={11} style={{ verticalAlign: 'middle' }} /> {session.room}</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          {[
            [de ? 'Anwesend' : 'Present',  present, C.mint],
            [de ? 'Entschuldigt' : 'Excused', excused, C.amber],
            [de ? 'Abwesend' : 'Absent',   absent,  C.rose],
            [de ? 'Gesamt' : 'Total',      total,   C.iris],
          ].map(([label, val, col]: any, i) => (
            <div key={i} style={{ padding: '7px 13px', borderRadius: 9, background: col + '12', display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 17, color: col }}>{val}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: pct >= 80 ? C.mint : pct >= 60 ? C.amber : C.rose }}>{pct}%</div>
            <div style={{ fontSize: 11, color: C.muted }}>{de ? 'Anwesenheitsquote' : 'Attendance rate'}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 3, background: C.line, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ height: 6, width: `${pct}%`, background: pct >= 80 ? C.mint : pct >= 60 ? C.amber : C.rose, borderRadius: 3, transition: 'width .3s' }} />
        </div>
      </div>

      {/* ===== LEGEND ===== */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          ['p', de ? '✅ Anwesend' : '✅ Present',       C.mint  + '18', C.mint],
          ['e', de ? '🟡 Entschuldigt' : '🟡 Excused',   C.amber + '18', C.amber],
          ['a', de ? '❌ Abwesend' : '❌ Absent',         C.rose  + '12', C.rose],
        ].map(([, label, bg, col]: any, i) => (
          <div key={i} style={{ padding: '5px 12px', borderRadius: 20, background: bg, fontSize: 12, color: col, fontWeight: 600 }}>
            {label}
          </div>
        ))}
        <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', marginLeft: 8 }}>
          {de ? '← Klicken zum Umschalten' : '← Click to toggle'}
        </div>
      </div>

      {/* ===== PARTICIPANTS ===== */}
      {loading && <div className="card" style={{ padding: 20, color: C.muted, fontSize: 13 }}>...</div>}

      {!loading && people.length === 0 && (
        <div className="card" style={{ padding: 20, color: C.muted, fontSize: 13, textAlign: 'center' }}>
          {de ? 'Keine Teilnehmer gefunden.' : 'No participants found.'}
        </div>
      )}

      {!loading && people.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
          {people.map((p, i) => {
            const st  = states[p.id] ?? 'a';
            const col = st === 'p' ? C.mint : st === 'e' ? C.amber : C.rose;
            const bg  = st === 'p' ? C.mint + '12' : st === 'e' ? C.amber + '12' : C.rose + '08';
          
  // ===== EXPORT EXCEL =====
  const exportExcel = () => {
    const data = people.map((p: any) => {
      const st = states[p.id] ?? 'a';
      return {
        [de ? 'Name'         : 'Name']:    p.name ?? '',
        [de ? 'Kontakt'      : 'Contact']: p.contact ?? p.email ?? '',
        [de ? 'Anwesenheit'  : 'Status']:  st === 'p' ? (de ? 'Anwesend'     : 'Present')
                                         : st === 'e' ? (de ? 'Entschuldigt'  : 'Excused')
                                         :               (de ? 'Abwesend'      : 'Absent'),
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, de ? 'Anwesenheit' : 'Attendance');
    ws['!cols'] = [{ wch: 25 }, { wch: 28 }, { wch: 15 }];

    const sessionTitle = (session.title ?? 'session').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `attendance_${sessionTitle}_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
              <div
                key={p.id ?? i}
                onClick={() => toggle(p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 12, cursor: 'pointer',
                  background: bg,
                  border: `1.5px solid ${col}`,
                  transition: 'all .15s',
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar n={p.name} c={COLORS[i % COLORS.length]} size={36} />
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 14, height: 14, borderRadius: 7,
                    background: col, border: '2px solid #fff',
                    display: 'grid', placeItems: 'center',
                  }}>
                    {st === 'p' && <Check size={8} color="#fff" strokeWidth={3} />}
                    {st === 'e' && <span style={{ fontSize: 7, color: '#fff', fontWeight: 700 }}>E</span>}
                    {st === 'a' && <span style={{ fontSize: 7, color: '#fff', fontWeight: 700 }}>A</span>}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: col, fontWeight: 700, marginTop: 2 }}>
                    {st === 'p' ? (de ? 'Anwesend'     : 'Present')
                   : st === 'e' ? (de ? 'Entschuldigt' : 'Excused')
                   :               (de ? 'Abwesend'     : 'Absent')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== SAVE BUTTON ===== */}
      {!loading && people.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          {saved && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.mint, fontSize: 13, fontWeight: 600 }}>
              <Check size={16} /> {de ? 'Gespeichert!' : 'Saved!'}
            </div>
          )}
          <button
            className="btn btn-ghost"
            style={{ padding: '10px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={exportExcel}
            disabled={people.length === 0}
          >
            <Download size={15} /> {de ? 'Excel exportieren' : 'Export Excel'}
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: 14 }}
            disabled={saving}
            onClick={save}
          >
            <ShieldCheck size={16} />
            {saving ? '...' : (de ? 'Anwesenheit speichern' : 'Save attendance')}
          </button>
        </div>
      )}
    </div>
  );
}
