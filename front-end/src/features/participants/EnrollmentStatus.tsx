import React, { useState } from 'react';
import { UserX, UserMinus, CheckCircle2, Clock, AlertTriangle, Pencil, X } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

const STATUS_CONFIG: Record<string, { de: string; en: string; color: string; icon: React.ReactNode; desc_de: string; desc_en: string }> = {
  enrolled:  { de: 'Angemeldet',         en: 'Enrolled',          color: C.iris,  icon: <Clock size={20} color="#fff" />,        desc_de: 'Teilnehmer ist angemeldet und wartet auf Start.',      desc_en: 'Participant is enrolled and awaiting start.' },
  active:    { de: 'Aktiv',              en: 'Active',            color: C.mint,  icon: <CheckCircle2 size={20} color="#fff" />, desc_de: 'Teilnehmer nimmt aktiv an der Maßnahme teil.',         desc_en: 'Participant is actively participating.' },
  completed: { de: 'Abgeschlossen',      en: 'Completed',         color: C.mint,  icon: <CheckCircle2 size={20} color="#fff" />, desc_de: 'Maßnahme erfolgreich abgeschlossen.',                  desc_en: 'Bootcamp successfully completed.' },
  dropped:   { de: 'Abgebrochen',        en: 'Dropped',           color: C.rose,  icon: <UserMinus size={20} color="#fff" />,    desc_de: 'Teilnehmer hat die Maßnahme vorzeitig abgebrochen.',   desc_en: 'Participant dropped out of the Bootcamp early.' },
  no_show:   { de: 'Nicht angetreten',   en: 'No-show',           color: C.rose,  icon: <UserX size={20} color="#fff" />,        desc_de: 'Teilnehmer ist nicht zur Maßnahme erschienen.',        desc_en: 'Participant did not attend the Bootcamp.' },
};

export default function EnrollmentStatus({ participant, onUpdate }: { participant: any; onUpdate?: () => void }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [newStatus, setNewStatus] = useState(participant?.status ?? 'enrolled');
  const [reason, setReason]     = useState('');
  const [date, setDate]         = useState('');

  const status = participant?.status ?? 'enrolled';
  const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG['enrolled'];
  const isAlert = status === 'no_show' || status === 'dropped';

  const save = async () => {
    setSaving(true);
    try {
      await api(`/participants/${participant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setEditing(false);
      onUpdate?.();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="card" style={{ marginTop: 15 }}>
      <div className="card-head">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAlert ? <UserX size={15} color={C.rose} /> : <CheckCircle2 size={15} color={C.mint} />}
          {de ? 'Anwesenheitsstatus (#17)' : 'Enrollment status (#17)'}
        </div>
        <button className="btn btn-ghost" style={{ padding: '6px 11px', fontSize: 12 }}
          onClick={() => { setEditing(!editing); setNewStatus(status); setReason(''); setDate(''); }}>
          <Pencil size={13} /> {de ? 'Bearbeiten' : 'Edit'}
        </button>
      </div>

      {/* STATUS BANNER */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12,
        background: cfg.color + '0D',
        border: `1.5px solid ${cfg.color}`,
        marginBottom: editing ? 14 : 0,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          {cfg.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: cfg.color }}>
            {de ? cfg.de : cfg.en}
          </div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
            {de ? cfg.desc_de : cfg.desc_en}
          </div>
          {isAlert && (
            <div style={{ marginTop: 8, padding: '6px 12px', borderRadius: 8, background: cfg.color + '12', fontSize: 12, color: cfg.color, fontWeight: 600, display: 'inline-block' }}>
              ⚠️ {de ? 'AZAV-relevant: Verbleib dokumentieren!' : 'AZAV-relevant: Document outcome!'}
            </div>
          )}
        </div>
        <span style={{ fontSize: 28, fontWeight: 900, color: cfg.color, opacity: 0.2 }}>
          #{status === 'no_show' ? '17' : status === 'dropped' ? '17' : ''}
        </span>
      </div>

      {/* ALL STATUS OPTIONS — mini overview */}
      {!editing && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          {Object.entries(STATUS_CONFIG).map(([key, s]) => (
            <span key={key} style={{
              fontSize: 11.5, padding: '4px 10px', borderRadius: 20, fontWeight: 600,
              background: status === key ? s.color : s.color + '12',
              color: status === key ? '#fff' : s.color,
              border: `1px solid ${s.color}`,
              opacity: status === key ? 1 : 0.5,
            }}>
              {de ? s.de : s.en}
              {status === key ? ' ✓' : ''}
            </span>
          ))}
        </div>
      )}

      {/* EDIT FORM */}
      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0 4px' }}>
          <label style={lbl}>{de ? 'Neuer Status' : 'New status'}
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={inp}>
              {Object.entries(STATUS_CONFIG).map(([key, s]) => (
                <option key={key} value={key}>{de ? s.de : s.en}</option>
              ))}
            </select>
          </label>

          {(newStatus === 'no_show' || newStatus === 'dropped') && (
            <>
              <div style={{ padding: '10px 14px', borderRadius: 9, background: C.rose + '0D', border: `1px solid ${C.rose}`, fontSize: 12.5, color: C.rose }}>
                ⚠️ {newStatus === 'no_show'
                  ? (de ? 'Nicht-Antreten muss AZAV-konform dokumentiert werden.' : 'No-show must be documented in compliance with AZAV.')
                  : (de ? 'Abbruch muss AZAV-konform dokumentiert werden.' : 'Dropout must be documented in compliance with AZAV.')}
              </div>
              <label style={lbl}>{de ? 'Datum' : 'Date'}
                <input value={date} onChange={(e) => setDate(e.target.value)}
                  style={inp} placeholder="01.01.2025" />
              </label>
              <label style={lbl}>{de ? 'Grund / Notiz' : 'Reason / Note'}
                <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                  style={{ ...inp, minHeight: 60, resize: 'vertical' }}
                  placeholder={de ? 'z.B. Teilnehmer hat sich nicht gemeldet…' : 'e.g. Participant did not respond…'} />
              </label>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn" style={{ padding: '8px 16px', background: C.soft, color: C.inkSoft }}
              disabled={saving} onClick={() => setEditing(false)}>
              {de ? 'Abbrechen' : 'Cancel'}
            </button>
            <button className="btn btn-primary" style={{ padding: '8px 16px' }}
              disabled={saving} onClick={save}>
              {saving ? '…' : (de ? 'Speichern' : 'Save')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = {
  width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9,
  border: '1px solid #E2E8F0', fontSize: 13, outline: 'none',
};