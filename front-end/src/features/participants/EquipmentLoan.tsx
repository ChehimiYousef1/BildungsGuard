import React, { useState, useEffect } from 'react';
import { Laptop, Plus, X, Check, Pencil, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';

const CONDITIONS = [
  { value: 'new',      de: 'Neu',         en: 'New' },
  { value: 'good',     de: 'Gut',         en: 'Good' },
  { value: 'fair',     de: 'Befriedigend',en: 'Fair' },
  { value: 'damaged',  de: 'Beschädigt',  en: 'Damaged' },
];

export default function EquipmentLoan({ participantId }: { participantId: string }) {
  const { lang } = useApp();
  const de = lang === 'de';

  const [rows, setRows]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm]     = useState({
    deviceName: '', serialNumber: '', brand: '',
    condition: 'good', loanDate: '', returnDate: '',
    returnedDate: '', returned: false,
    signedByParticipant: false, notes: '',
  });

  const load = async () => {
    try {
      const d = await api<any[]>(`/equipment-loans?participantId=${participantId}`);
      setRows(Array.isArray(d) ? d : []);
    } catch { setRows([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [participantId]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditId(null);
    setForm({ deviceName: '', serialNumber: '', brand: '', condition: 'good', loanDate: '', returnDate: '', returnedDate: '', returned: false, signedByParticipant: false, notes: '' });
    setOpen(true);
  };

  const openEdit = (r: any) => {
    setEditId(r.id);
    setForm({
      deviceName: r.deviceName ?? '',
      serialNumber: r.serialNumber ?? '',
      brand: r.brand ?? '',
      condition: r.condition ?? 'good',
      loanDate: r.loanDate ?? '',
      returnDate: r.returnDate ?? '',
      returnedDate: r.returnedDate ?? '',
      returned: r.returned ?? false,
      signedByParticipant: r.signedByParticipant ?? false,
      notes: r.notes ?? '',
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.deviceName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        participantId,
        deviceName: form.deviceName.trim(),
        serialNumber: form.serialNumber || undefined,
        brand: form.brand || undefined,
        condition: form.condition || undefined,
        loanDate: form.loanDate || undefined,
        returnDate: form.returnDate || undefined,
        returnedDate: form.returnedDate || undefined,
        returned: form.returned,
        signedByParticipant: form.signedByParticipant,
        notes: form.notes || undefined,
      };
      if (editId) {
        await api(`/equipment-loans/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/equipment-loans', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      await load();
    } catch (e) { console.error('equipment loan save failed', e); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm(de ? 'Gerät löschen?' : 'Delete equipment?')) return;
    try { await api(`/equipment-loans/${id}`, { method: 'DELETE' }); await load(); }
    catch (e) { console.error(e); }
  };

  const condLabel = (v: string) => CONDITIONS.find((c) => c.value === v)?.[lang as 'de'|'en'] ?? v;

  const isOverdue = (r: any) => {
    if (r.returned || !r.returnDate) return false;
    const [d, m, y] = r.returnDate.split('.').map(Number);
    return new Date(y, m - 1, d).getTime() < Date.now();
  };

  return (
    <div className="card" style={{ marginTop: 15 }}>
      <div className="card-head">
        <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Laptop size={15} color={C.iris} />
          {de ? 'Geräteüberlassung (#2)' : 'Equipment loan (#2)'} · {rows.length}
        </div>
        <button className="btn btn-primary" style={{ padding: '7px 13px', fontSize: 12 }} onClick={openNew}>
          <Plus size={13} /> {de ? 'Gerät' : 'Device'}
        </button>
      </div>

      {loading && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
      {!loading && rows.length === 0 && (
        <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>
          {de ? 'Keine Geräte ausgeliehen.' : 'No equipment loaned yet.'}
        </div>
      )}

      {!loading && rows.map((r, i) => (
        <div key={r.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0',
          borderBottom: i < rows.length - 1 ? `1px solid ${C.lineSoft}` : 'none',
        }}>
          {/* أيقونة الحالة */}
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: r.returned ? C.mint + '18' : isOverdue(r) ? C.rose + '18' : C.iris + '18',
            display: 'grid', placeItems: 'center',
          }}>
            <Laptop size={18} color={r.returned ? C.mint : isOverdue(r) ? C.rose : C.iris} />
          </div>

          <div style={{ flex: 1 }}>
            {/* اسم الجهاز */}
            <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              {r.deviceName}
              {r.brand && <span style={{ fontWeight: 400, fontSize: 11.5, color: C.muted }}>{r.brand}</span>}
              {r.returned
                ? <span className="badge" style={{ background: C.mint + '18', color: C.mint, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <CheckCircle2 size={11} /> {de ? 'Zurückgegeben' : 'Returned'}
                  </span>
                : isOverdue(r)
                  ? <span className="badge" style={{ background: C.rose + '18', color: C.rose, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <AlertTriangle size={11} /> {de ? 'Überfällig' : 'Overdue'}
                    </span>
                  : <span className="badge" style={{ background: C.amber + '18', color: C.amber }}>
                      {de ? 'Ausgeliehen' : 'On loan'}
                    </span>}
            </div>

            {/* تفاصيل */}
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {r.serialNumber && <span>S/N: {r.serialNumber}</span>}
              {r.condition && <span>{de ? 'Zustand:' : 'Condition:'} {condLabel(r.condition)}</span>}
              {r.loanDate && <span>{de ? 'Ausgabe:' : 'Loaned:'} {r.loanDate}</span>}
              {r.returnDate && <span>{de ? 'Rückgabe:' : 'Due:'} {r.returnDate}</span>}
              {r.returnedDate && <span>{de ? 'Zurück am:' : 'Returned:'} {r.returnedDate}</span>}
            </div>

            {/* توقيع */}
            {r.signedByParticipant && (
              <div style={{ fontSize: 11, color: C.mint, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Check size={11} /> {de ? 'Vom Teilnehmer unterschrieben' : 'Signed by participant'}
              </div>
            )}
            {r.notes && (
              <div style={{ fontSize: 11.5, color: C.muted, marginTop: 4, fontStyle: 'italic' }}>{r.notes}</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            <button className="icon-mini" onClick={() => openEdit(r)}><Pencil size={13} color={C.muted} /></button>
            <button className="icon-mini" onClick={() => remove(r.id)}><Trash2 size={13} color={C.muted} /></button>
          </div>
        </div>
      ))}

      {/* MODAL */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 480, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId ? (de ? 'Gerät bearbeiten' : 'Edit device') : (de ? 'Gerät hinzufügen' : 'Add device')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={lbl}>{de ? 'Gerätename *' : 'Device name *'}
                <input autoFocus value={form.deviceName} onChange={(e) => set('deviceName', e.target.value)}
                  style={inp} placeholder={de ? 'z.B. Laptop Dell Latitude 5420' : 'e.g. Laptop Dell Latitude 5420'} />
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Marke' : 'Brand'}
                  <input value={form.brand} onChange={(e) => set('brand', e.target.value)}
                    style={inp} placeholder="Dell, HP, Lenovo…" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>S/N
                  <input value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)}
                    style={inp} placeholder="SN-12345" />
                </label>
              </div>

              <label style={lbl}>{de ? 'Zustand' : 'Condition'}
                <select value={form.condition} onChange={(e) => set('condition', e.target.value)} style={inp}>
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c[lang as 'de'|'en']}</option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'flex', gap: 10 }}>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Ausgabedatum' : 'Loan date'}
                  <input value={form.loanDate} onChange={(e) => set('loanDate', e.target.value)}
                    style={inp} placeholder="01.01.2025" />
                </label>
                <label style={{ ...lbl, flex: 1 }}>{de ? 'Rückgabedatum (geplant)' : 'Return date (planned)'}
                  <input value={form.returnDate} onChange={(e) => set('returnDate', e.target.value)}
                    style={inp} placeholder="31.12.2025" />
                </label>
              </div>

              <label style={lbl}>{de ? 'Tatsächlich zurückgegeben am' : 'Actually returned on'}
                <input value={form.returnedDate} onChange={(e) => set('returnedDate', e.target.value)}
                  style={inp} placeholder="31.12.2025" />
              </label>

              <label style={lbl}>{de ? 'Notizen' : 'Notes'}
                <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                  style={{ ...inp, minHeight: 55, resize: 'vertical' }} />
              </label>

              {/* Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.returned}
                    onChange={(e) => set('returned', e.target.checked)} />
                  {de ? 'Gerät zurückgegeben ✅' : 'Device returned ✅'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 12.5, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.signedByParticipant}
                    onChange={(e) => set('signedByParticipant', e.target.checked)} />
                  {de ? 'Vom Teilnehmer unterschrieben' : 'Signed by participant'}
                </label>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={saving || !form.deviceName.trim()} onClick={submit}>
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