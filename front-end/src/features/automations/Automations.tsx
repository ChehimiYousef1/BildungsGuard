import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { AUTOM } from '../../config/automations';
import { api } from '../../lib/api';

export default function Automations() {
  const { t } = useApp();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await api<any[]>('/automations');
      setRows(Array.isArray(data) ? data : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  // ابحث عن سجلّ الأتمتة بالـ key. الافتراضي: مفعّل (true) إن لم يوجد سجلّ بعد.
  const findRow = (key: string) => rows.find((r) => r.key === key);
  const isOn = (key: string) => {
    const r = findRow(key);
    return r ? r.enabled : true;
  };

  const toggle = async (key: string) => {
    setBusy(key);
    const existing = findRow(key);
    try {
      if (existing) {
        // حدّث الموجود
        await api(`/automations/${existing.id}`, { method: 'PATCH', body: JSON.stringify({ enabled: !existing.enabled }) });
      } else {
        // أنشئ سجلًّا جديدًا (أوّل مرّة) — افتراضيًّا كان مفعّلًا، فالنقر يطفئه
        await api('/automations', { method: 'POST', body: JSON.stringify({ key, enabled: false }) });
      }
      await load();
    } catch (e) { console.error('toggle automation failed', e); }
    finally { setBusy(null); }
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 15, display: 'flex', gap: 11, alignItems: 'center', background: C.soft, fontSize: 12.5, color: C.inkSoft }}><Zap size={17} color={C.iris} style={{ flexShrink: 0 }} /> {t('autom_intro')}</div>
      <div className="set-grid">
        {AUTOM.map((a) => {
          const on = isOn(a.id);
          const loadingThis = busy === a.id;
          return (
            <div key={a.id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="chan-ic" style={{ width: 38, height: 38, background: (on ? C.iris : C.muted) + '22', color: on ? C.iris : C.mutedLight }}><a.ic size={19} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <div className="set-section-t" style={{ marginBottom: 0 }}>{t(a.tk)}</div>
                    <span className="badge" style={{ background: (on ? C.mint : C.muted) + '22', color: on ? C.mint : C.muted }}>{on ? t('autom_on') : t('autom_off')}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{t(a.sk)}</div>
                </div>
                <button className={'sw' + (on ? ' on' : '')} disabled={loading || loadingThis} onClick={() => toggle(a.id)} aria-label={t(a.tk)} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}