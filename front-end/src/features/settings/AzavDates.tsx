import React, { useState, useEffect } from 'react';
import { BadgeCheck, Check } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

export default function AzavDates() {
  const { lang } = useApp();
  const de = lang === 'de';
  const [tenant, setTenant] = useState<any>(null);
  const [form, setForm] = useState({ nextAudit: '', azavValidUntil: '', certifier: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const tn = await api<any>('/tenants/me').catch(() => null);
      if (tn) {
        setTenant(tn);
        setForm({
          nextAudit: tn.nextAudit ?? '',
          azavValidUntil: tn.azavValidUntil ?? '',
          certifier: tn.certifier ?? '',
        });
      }
    })();
  }, []);

  const set = (k: string, v: string) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false); };

  const save = async () => {
    if (!tenant?.id) return;
    setSaving(true);
    try {
      await api(`/tenants/${tenant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nextAudit: form.nextAudit.trim() || null,
          azavValidUntil: form.azavValidUntil.trim() || null,
          certifier: form.certifier.trim() || null,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error('save azav dates failed', e); alert(de ? 'Speichern fehlgeschlagen.' : 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <BadgeCheck size={17} color={C.iris} />
        <div className="set-section-t" style={{ margin: 0 }}>{de ? 'AZAV-Termine' : 'AZAV dates'}</div>
      </div>
      <div className="set-section-s">{de ? 'Termine für Überwachungsaudit und Re-Zertifizierung' : 'Surveillance audit and re-certification dates'}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 6 }}>
        <label style={lbl}>{de ? 'Nächstes Überwachungsaudit' : 'Next surveillance audit'}
          <input value={form.nextAudit} onChange={(e) => set('nextAudit', e.target.value)} style={inp} placeholder="15.09.2026" />
        </label>
        <label style={lbl}>{de ? 'Re-Zertifizierung fällig' : 'Re-certification due'}
          <input value={form.azavValidUntil} onChange={(e) => set('azavValidUntil', e.target.value)} style={inp} placeholder="31.12.2026" />
        </label>
        <label style={lbl}>{de ? 'Zertifizierungsstelle' : 'Certifier'}
          <input value={form.certifier} onChange={(e) => set('certifier', e.target.value)} style={inp} placeholder="CertQua" />
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-primary" style={{ padding: '9px 18px' }} disabled={saving || !tenant} onClick={save}>
            {saving ? '…' : (de ? 'Speichern' : 'Save')}
          </button>
          {saved && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: C.mint, fontWeight: 600 }}><Check size={14} /> {de ? 'Gespeichert' : 'Saved'}</span>}
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { fontSize: 12.5, color: C.inkSoft, display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = { width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none' };