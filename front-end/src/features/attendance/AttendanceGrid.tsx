import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ShieldCheck, Clock, MapPin, Check, Bell, BellRing, Lock, Unlock } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { api } from '../../lib/api';

const COLORS = ['#6D5DF6', '#8B5CF6', '#3B82F6', '#F59E0B', '#F4475F', '#0FB6A0'];
const WAIT_SECONDS = 10 * 60; // 10 دقائق
//const WAIT_SECONDS = 10; for 10 Sec
export default function AttGrid({ session, back }: { session: any; back: () => void }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [people, setPeople] = useState<any[]>([]);
  const [states, setStates] = useState<Record<string, 'p' | 'e' | 'a'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ===== TIMER =====
  const [elapsed, setElapsed] = useState(0); // ثوانٍ منذ فتح الصفحة
  const [reminderShown, setReminderShown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remaining = Math.max(0, WAIT_SECONDS - elapsed);
  const isReady = elapsed >= WAIT_SECONDS; // مرّت ١٠ دقائق
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Reminder عند انتهاء الوقت
  useEffect(() => {
    if (isReady && !reminderShown) {
      setReminderShown(true);
      // Browser notification لو مسموح
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(de ? 'Anwesenheit erfassen!' : 'Take Attendance!', {
          body: de
            ? `Sitzung "${session.title}" — 10 Minuten sind vergangen.`
            : `Session "${session.title}" — 10 minutes have passed.`,
          icon: '/favicon.ico',
        });
      }
    }
  }, [isReady, reminderShown]);

  // طلب إذن الـ notification عند فتح الصفحة
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
        const map: Record<string, 'p' | 'e' | 'a'> = {};
        list.forEach((p) => { map[p.id] = 'p'; });
        (Array.isArray(existing) ? existing : []).forEach((a: any) => {
          const st = a.status === 'present' ? 'p' : a.status === 'excused' ? 'e' : a.status === 'absent' ? 'a' : (a.present ? 'p' : 'a');
          if (a.participantId) map[a.participantId] = st;
        });
        setStates(map);
      } finally { setLoading(false); }
    })();
  }, [session.id]);

  const set = (id: string, v: 'p' | 'e' | 'a') => { setStates((s) => ({ ...s, [id]: v })); setSaved(false); };
  const present = Object.values(states).filter((x) => x === 'p').length;

  const save = async () => {
    setSaving(true);
    const STATUS = { p: 'present', e: 'excused', a: 'absent' } as const;
    const entries = people.map((p) => {
      const st = states[p.id] ?? 'p';
      return { participantId: p.id, present: st === 'p', status: STATUS[st] };
    });
    try {
      await api(`/attendance/${session.id}`, { method: 'POST', body: JSON.stringify({ entries }) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('save attendance failed', e);
      alert(de ? 'Speichern fehlgeschlagen.' : 'Save failed.');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <button className="back" onClick={back}><ArrowLeft size={15} /> {de ? 'Zurück' : 'Back'}</button>

      {/* ===== TIMER BANNER ===== */}
      <div style={{
        marginBottom: 14,
        padding: '14px 18px',
        borderRadius: 14,
        border: `2px solid ${isReady ? C.mint : C.amber}`,
        background: isReady ? C.mint + '10' : C.amber + '10',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        {/* أيقونة */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: isReady ? C.mint : C.amber,
          display: 'grid', placeItems: 'center',
        }}>
          {isReady
            ? <BellRing size={22} color="#fff" />
            : <Clock size={22} color="#fff" />}
        </div>

        {/* النص */}
        <div style={{ flex: 1 }}>
          {isReady ? (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.mint }}>
                {de ? '✅ Zeit für die Anwesenheitskontrolle!' : '✅ Time to record attendance!'}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {de
                  ? '10 Minuten sind vergangen — bitte jetzt die Anwesenheit erfassen und speichern.'
                  : '10 minutes have passed — please record and save attendance now.'}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.amber }}>
                {de ? '⏳ Warten auf Anwesenheitskontrolle' : '⏳ Waiting to record attendance'}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {de
                  ? `Anwesenheitskontrolle wird in ${mm}:${ss} freigegeben.`
                  : `Attendance will be unlocked in ${mm}:${ss}.`}
              </div>
            </>
          )}
        </div>

        {/* Countdown / Done */}
        <div style={{
          minWidth: 80, textAlign: 'center', padding: '8px 14px', borderRadius: 10,
          background: isReady ? C.mint : C.amber,
          color: '#fff',
        }}>
          {isReady ? (
            <div>
              <Unlock size={18} />
              <div style={{ fontSize: 10, fontWeight: 600, marginTop: 3 }}>
                {de ? 'Freigegeben' : 'Unlocked'}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'monospace', lineHeight: 1 }}>
                {mm}:{ss}
              </div>
              <div style={{ fontSize: 10, marginTop: 3, opacity: 0.85 }}>
                {de ? 'verbleibend' : 'remaining'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== REMINDER POPUP (بعد ما خلص الوقت) ===== */}
      {isReady && reminderShown && (
        <div style={{
          marginBottom: 14, padding: '12px 16px', borderRadius: 12,
          background: C.mint, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'pulse 1s ease-in-out',
        }}>
          <BellRing size={18} color="#fff" />
          <div style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>
            {de
              ? `Erinnerung: Anwesenheit für "${session.title}" jetzt erfassen!`
              : `Reminder: Record attendance for "${session.title}" now!`}
          </div>
          <button
            onClick={() => setReminderShown(false)}
            style={{ background: 'rgba(255,255,255,.25)', border: 'none', color: '#fff', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
          >
            {de ? 'OK' : 'OK'}
          </button>
        </div>
      )}

      {/* ===== SESSION HEADER ===== */}
      <div className="detail-head">
        <div style={{ flex: 1 }}>
          <h2 className="disp" style={{ fontSize: 21, fontWeight: 700 }}>{session.title}</h2>
          <div className="mono" style={{ color: C.muted, fontSize: 12.5, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {session.courseName && <span>{session.courseName}</span>}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} /> {session.time || (de ? 'keine Zeit' : 'no time')}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={12} /> {session.room || (de ? 'kein Ort' : 'no location')}
            </span>
          </div>
        </div>

        {/* Save Button — مقفول قبل ١٠ دقائق */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <button
            className={isReady ? 'btn btn-primary' : 'btn btn-ghost'}
            disabled={saving || loading || !isReady}
            onClick={save}
            style={{ opacity: isReady ? 1 : 0.5 }}
            title={!isReady ? (de ? `Noch ${mm}:${ss} warten` : `Wait ${mm}:${ss} more`) : undefined}
          >
            {!isReady
              ? <><Lock size={13} /> {mm}:{ss}</>
              : saving ? '…'
              : (de ? 'Speichern' : 'Save')}
          </button>
          {!isReady && (
            <div style={{ fontSize: 10.5, color: C.muted }}>
              {de ? 'Wird freigegeben nach 10 Min.' : 'Unlocks after 10 min.'}
            </div>
          )}
        </div>
      </div>

      {/* ===== GRID ===== */}
      <div className="card" style={{ padding: '10px 10px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px 12px', fontSize: 12.5, color: C.muted, flexWrap: 'wrap', gap: 8 }}>
          <span>{present} / {people.length} {de ? 'anwesend' : 'present'}</span>
          {saved
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.mint, fontWeight: 600 }}>
                <Check size={14} /> {de ? 'Gespeichert' : 'Saved'}
              </span>
            : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={14} color={C.mint} /> {de ? 'Revisionssicher' : 'Audit-proof'}
              </span>}
        </div>

        {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
        {!loading && people.length === 0 && (
          <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>
            {de ? 'Keine Teilnehmer.' : 'No participants.'}
          </div>
        )}

        {!loading && people.map((p, i) => (
          <div key={p.id} className="att-row" style={{ opacity: isReady ? 1 : 0.6, pointerEvents: isReady ? 'auto' : 'none' }}>
            <Avatar n={p.name} c={COLORS[i % COLORS.length]} size={30} />
            <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{p.name}</div>
            <div className="seg">
              <button className={states[p.id] === 'p' ? 'p' : ''} onClick={() => set(p.id, 'p')}>{de ? 'Anwesend' : 'Present'}</button>
              <button className={states[p.id] === 'e' ? 'e' : ''} onClick={() => set(p.id, 'e')}>{de ? 'Entschuldigt' : 'Excused'}</button>
              <button className={states[p.id] === 'a' ? 'a' : ''} onClick={() => set(p.id, 'a')}>{de ? 'Abwesend' : 'Absent'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}