import React, { useState, useEffect } from 'react';
import { Building2, Check } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

export default function OrgName() {
  const { lang, setOrg } = useApp();
  const de = lang === 'de';
  const [tenant, setTenant] = useState<any>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const tn = await api<any>('/tenants/me').catch(() => null);
      if (tn) {
        setTenant(tn);
        setName(tn.name ?? '');
        if (setOrg && tn.name) setOrg(tn.name); // زامن العرض في الواجهة
      }
    })();
  }, []);

  const save = async () => {
    if (!tenant?.id || !name.trim()) return;
    setSaving(true);
    try {
      await api(`/tenants/${tenant.id}`, { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) });
      if (setOrg) setOrg(name.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error('save org name failed', e); alert(de ? 'Speichern fehlgeschlagen.' : 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Building2 size={17} color={C.iris} />
        <div className="set-section-t" style={{ margin: 0 }}>{de ? 'Organisation' : 'Organization'}</div>
      </div>
      <div className="set-section-s">{de ? 'Name der Einrichtung (wird überall angezeigt)' : 'Institution name (shown everywhere)'}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 6 }}>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
          style={inp}
          placeholder={de ? 'z.B. Omah Bootcamps GmbH' : 'e.g. Omah Bootcamps GmbH'}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-primary" style={{ padding: '9px 18px' }} disabled={saving || !tenant || !name.trim()} onClick={save}>
            {saving ? '…' : (de ? 'Speichern' : 'Save')}
          </button>
          {saved && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: C.mint, fontWeight: 600 }}><Check size={14} /> {de ? 'Gespeichert' : 'Saved'}</span>}
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '9px 11px', borderRadius: 9, border: `1px solid ${C.line}`, fontSize: 13, outline: 'none' };