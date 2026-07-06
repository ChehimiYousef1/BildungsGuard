import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, Check } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

export default function LogoUpload() {
  const { lang, logo, setLogo } = useApp();
  const de = lang === 'de';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const getTenantId = async () => {
    const tn = await api<any>('/tenants/me').catch(() => null);
    return tn?.id ?? null;
  };

  const onFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { alert(de ? 'Bitte ein Bild wählen.' : 'Please choose an image.'); return; }
    if (file.size > 500 * 1024) { alert(de ? 'Bild zu groß (max. 500 KB).' : 'Image too large (max 500 KB).'); return; }
    setSaving(true);
    try {
      const base64: string = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.onerror = () => rej(new Error('read failed'));
        r.readAsDataURL(file);
      });
      const id = await getTenantId();
      if (!id) throw new Error('no tenant');
      await api(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify({ logo: base64 }) });
      setLogo(base64);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) { console.error('logo upload failed', e); alert(de ? 'Hochladen fehlgeschlagen.' : 'Upload failed.'); }
    finally { setSaving(false); }
  };

  const removeLogo = async () => {
    setSaving(true);
    try {
      const id = await getTenantId();
      if (!id) throw new Error('no tenant');
      await api(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify({ logo: null }) });
      setLogo(null);
    } catch (e) { console.error('remove logo failed', e); }
    finally { setSaving(false); }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ImageIcon size={17} color={C.iris} />
        <div className="set-section-t" style={{ margin: 0 }}>{de ? 'Logo' : 'Logo'}</div>
      </div>
      <div className="set-section-s">{de ? 'Firmenlogo (oben links). Max. 500 KB.' : 'Company logo (top-left). Max 500 KB.'}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: logo ? '#fff' : C.soft, border: `1px solid ${C.line}`, display: 'grid', placeItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {logo ? <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={22} color={C.mutedLight} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="btn btn-primary" style={{ padding: '8px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Upload size={14} /> {saving ? '…' : (de ? 'Hochladen' : 'Upload')}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
          </label>
          {logo && <button className="btn btn-ghost" style={{ padding: '8px 14px' }} disabled={saving} onClick={removeLogo}><Trash2 size={14} /> {de ? 'Entfernen' : 'Remove'}</button>}
        </div>
        {saved && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: C.mint, fontWeight: 600 }}><Check size={14} /> {de ? 'Gespeichert' : 'Saved'}</span>}
      </div>
    </div>
  );
}