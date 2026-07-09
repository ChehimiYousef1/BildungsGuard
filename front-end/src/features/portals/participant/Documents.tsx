import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, AlertTriangle, X, FileText,
  Download, Circle, Shield, Laptop, Camera,
  Stethoscope, File, Award, BookOpen, Clock
} from 'lucide-react';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api, getToken } from '../../../lib/api';
import { useMe } from './useMe';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const TYPE_META: Record<string, { icon: any; color: string; de: string; en: string }> = {
  PARTICIPANT_CONTRACT: { icon: FileText,    color: C.iris,    de: 'Teilnahmevertrag',  en: 'Participant contract' },
  EQUIPMENT_LOAN:       { icon: Laptop,      color: C.amber,   de: 'Geräteüberlassung', en: 'Equipment loan'       },
  PRIVACY_CONSENT:      { icon: Shield,      color: C.mint,    de: 'Datenschutz',       en: 'Privacy consent'      },
  MEDIA_CONSENT:        { icon: Camera,      color: C.iris,    de: 'Medienrechte',      en: 'Media consent'        },
  SICK_NOTE:            { icon: Stethoscope, color: '#e11d48', de: 'Krankmeldung',      en: 'Sick note'            },
  CV:                   { icon: File,        color: C.amber,   de: 'Lebenslauf',        en: 'CV'                   },
  CERTIFICATE:          { icon: Award,       color: C.mint,    de: 'Zertifikat',        en: 'Certificate'          },
  OTHER:                { icon: BookOpen,    color: C.iris,    de: 'Sonstiges',         en: 'Other'                },
};

// ===== Format responsible field =====
function formatResponsible(responsible: string | null | undefined, type: string, de: boolean): string {
  if (!responsible) return '—';
  try {
    const obj = JSON.parse(responsible);
    if (typeof obj !== 'object' || obj === null) return responsible;

    // CV
    if (type === 'CV') {
      const parts: string[] = [];
      if (obj.education)  parts.push(`${de ? 'Bildung' : 'Education'}: ${obj.education}`);
      if (obj.experience) parts.push(`${de ? 'Erfahrung' : 'Experience'}: ${obj.experience} ${de ? 'Jahre' : 'years'}`);
      if (obj.languages)  parts.push(`${de ? 'Sprachen' : 'Languages'}: ${obj.languages}`);
      if (obj.skills)     parts.push(`${de ? 'Kenntnisse' : 'Skills'}: ${obj.skills}`);
      if (obj.lastUpdated) parts.push(`${de ? 'Aktualisiert' : 'Updated'}: ${obj.lastUpdated}`);
      return parts.join(' · ') || '—';
    }

    // Privacy / Media consent
    if (type === 'PRIVACY_CONSENT' || type === 'MEDIA_CONSENT') {
      const parts: string[] = [];
      if (obj.name)       parts.push(obj.name);
      if (obj.signedDate) parts.push(`${de ? 'Unterschrieben' : 'Signed'}: ${obj.signedDate}`);
      if (obj.version)    parts.push(`v${obj.version}`);
      if (obj.mediaTypes) parts.push(Array.isArray(obj.mediaTypes) ? obj.mediaTypes.join(', ') : obj.mediaTypes);
      if (obj.purpose)    parts.push(obj.purpose);
      return parts.join(' · ') || '—';
    }

    // Sick note
    if (type === 'SICK_NOTE') {
      const parts: string[] = [];
      if (obj.dateFrom)    parts.push(`${de ? 'Von' : 'From'}: ${obj.dateFrom}`);
      if (obj.dateTo)      parts.push(`${de ? 'Bis' : 'To'}: ${obj.dateTo}`);
      if (obj.doctor)      parts.push(`${de ? 'Arzt' : 'Doctor'}: ${obj.doctor}`);
      if (obj.institution) parts.push(obj.institution);
      if (obj.notes)       parts.push(obj.notes);
      return parts.join(' · ') || '—';
    }

    // Certificate
    if (type === 'CERTIFICATE') {
      const parts: string[] = [];
      if (obj.title)      parts.push(obj.title);
      if (obj.certType)   parts.push(obj.certType);
      if (obj.issuedDate) parts.push(`${de ? 'Ausgestellt' : 'Issued'}: ${obj.issuedDate}`);
      if (obj.issuedBy)   parts.push(obj.issuedBy);
      if (obj.validUntil) parts.push(`${de ? 'Gültig bis' : 'Valid until'}: ${obj.validUntil}`);
      return parts.join(' · ') || '—';
    }

    // Generic fallback — join meaningful values
    const vals = Object.entries(obj)
      .filter(([k, v]) => v && k !== 'version' && k !== 'scope')
      .map(([, v]) => String(v));
    return vals.join(' · ') || '—';
  } catch {
    return responsible;
  }
}

// ===== Format type label for CAT_ types =====
function typeLabel(type: string, lang: 'de' | 'en'): string {
  if (type?.startsWith('CAT_')) return type.replace('CAT_', '').slice(0, 8).replace(/_/g, ' ') || (lang === 'de' ? 'Kategorie' : 'Category');
  return TYPE_META[type]?.[lang] ?? type;
}

export default function PaDocs() {
  const { lang } = useApp();
  const de = lang === 'de';
  const { me, loading: meLoading } = useMe();

  const [docs,    setDocs]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<string>('all');

  useEffect(() => {
    if (meLoading) return;
    if (!me?.id) { setLoading(false); return; }
    (async () => {
      try {
        const d = await api<any[]>(`/documents?participantId=${me.id}`).catch(() =>
          api<any[]>(`/documents/participant/${me.id}`).catch(() => [])
        );
        setDocs(Array.isArray(d) ? d : []);
      } catch { setDocs([]); }
      finally { setLoading(false); }
    })();
  }, [me?.id, meLoading]);

  const openDoc = async (id: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API}/documents/${id}/file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) { alert(de ? 'Datei nicht verfügbar.' : 'File not available.'); return; }
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (e) { console.error('open doc failed', e); }
  };

  const statusInfo = (status: string) => {
    if (status === 'doc_ready')   return { icon: <CheckCircle2 size={15} color={C.mint} />,  text: de ? 'Vollständig' : 'Complete',  bg: C.mint  + '12', col: C.mint   };
    if (status === 'doc_partial') return { icon: <AlertTriangle size={14} color={C.amber} />, text: de ? 'Teilweise'  : 'Partial',   bg: C.amber + '12', col: C.amber  };
    if (status === 'doc_manual')  return { icon: <AlertTriangle size={14} color={C.amber} />, text: de ? 'Manuell'    : 'Manual',    bg: C.amber + '12', col: C.amber  };
    if (status === 'doc_missing') return { icon: <Circle size={13} color={C.rose} />,         text: de ? 'Fehlt'      : 'Missing',   bg: C.rose  + '12', col: C.rose   };
    return                               { icon: <Circle size={13} color={C.muted} />,        text: de ? 'Ausstehend' : 'Pending',   bg: C.soft,         col: C.muted  };
  };

  const getTypeIcon = (type: string) => {
    const meta = TYPE_META[type];
    if (!meta) return <FileText size={18} color={C.iris} />;
    const Icon = meta.icon;
    return <Icon size={18} color={meta.color} />;
  };

  const getTypeColor = (type: string) => TYPE_META[type]?.color ?? C.iris;

  const complete = docs.filter((d) => d.status === 'doc_ready').length;
  const missing  = docs.filter((d) => !d.status || d.status === 'doc_missing').length;
  const pct      = docs.length > 0 ? Math.round((complete / docs.length) * 100) : 0;

  const filtered = filter === 'all' ? docs : docs.filter((d) => d.status === filter);

  if (meLoading || loading) {
    return <div className="card" style={{ padding: 30, color: C.muted, fontSize: 13 }}>...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ===== HEADER ===== */}
      <div className="card" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: C.iris, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <FileText size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: C.iris }}>
              {de ? 'Meine Dokumente' : 'My Documents'}
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
              {docs.length} {de ? 'Dokumente insgesamt' : 'documents total'}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: pct === 100 ? C.mint : C.iris }}>{pct}%</div>
            <div style={{ fontSize: 11, color: C.muted }}>{de ? 'vollständig' : 'complete'}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 3, background: C.line, marginTop: 14, overflow: 'hidden' }}>
          <div style={{ height: 6, width: `${pct}%`, background: pct === 100 ? C.mint : C.iris, borderRadius: 3, transition: 'width .4s' }} />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          {[
            [de ? 'Vollständig' : 'Complete', complete,    C.mint],
            [de ? 'Fehlend'    : 'Missing',  missing,     C.rose],
            [de ? 'Gesamt'     : 'Total',    docs.length, C.iris],
          ].map(([label, val, col]: any, i) => (
            <div key={i} style={{ padding: '6px 12px', borderRadius: 9, background: col + '10', display: 'flex', gap: 7, alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 15, color: col }}>{val}</span>
              <span style={{ fontSize: 11.5, color: C.muted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div style={{ display: 'flex', gap: 7 }}>
        {[
          { key: 'all',         label: de ? 'Alle'        : 'All'      },
          { key: 'doc_ready',   label: de ? 'Vollständig' : 'Complete' },
          { key: 'doc_missing', label: de ? 'Fehlend'     : 'Missing'  },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${filter === f.key ? C.iris : C.line}`,
              background: filter === f.key ? C.iris : '#fff',
              color: filter === f.key ? '#fff' : C.inkSoft,
              cursor: 'pointer',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ===== DOCS LIST ===== */}
      {filtered.length === 0 && (
        <div className="card" style={{ padding: 30, textAlign: 'center' }}>
          <FileText size={34} color={C.mutedLight} style={{ margin: '0 auto 12px', display: 'block' }} />
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, color: '#334155' }}>
            {de ? 'Keine Dokumente.' : 'No documents.'}
          </div>
          <div style={{ fontSize: 12.5, color: C.muted }}>
            {de ? 'Dokumente werden von der Verwaltung hochgeladen.' : 'Documents are uploaded by administration.'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((d, i) => {
          const hasFile = !!(d.fileRef || d.hasFile || d.fileName);
          const si      = statusInfo(d.status ?? '');
          const col     = getTypeColor(d.type ?? '');

          // ✅ Clean type label (no CAT_xxx raw IDs)
          const docTitle = d.title || typeLabel(d.type ?? '', lang as 'de' | 'en') || (de ? 'Dokument' : 'Document');

          // ✅ Clean responsible field (no JSON)
          const responsibleText = formatResponsible(d.responsible, d.type ?? '', de);

          return (
            <div key={d.id ?? i} className="card" style={{
              padding: '14px 16px',
              border: `1.5px solid ${d.status === 'doc_ready' ? C.mint + '40' : d.status === 'doc_missing' ? C.rose + '30' : C.line}`,
              background: d.status === 'doc_ready' ? C.mint + '04' : '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                {/* Type icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                  background: col + '15', display: 'grid', placeItems: 'center',
                }}>
                  {getTypeIcon(d.type ?? '')}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b' }}>
                    {docTitle}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {d.type && !d.type.startsWith('CAT_') && (
                      <span style={{ color: col, fontWeight: 600 }}>{typeLabel(d.type, lang as 'de' | 'en')}</span>
                    )}
                    {responsibleText !== '—' && (
                      <span>{de ? 'Info:' : 'Info:'} {responsibleText}</span>
                    )}
                    {d.createdAt && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} />
                        {new Date(d.createdAt).toLocaleDateString(de ? 'de-DE' : 'en-GB')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                  background: si.bg, color: si.col,
                  display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
                }}>
                  {si.icon} {si.text}
                </span>

                {/* Download / No file */}
                {hasFile ? (
                  <button className="btn btn-primary"
                    style={{ padding: '7px 13px', fontSize: 11.5, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    onClick={() => openDoc(d.id)}>
                    <Download size={13} /> {de ? 'Öffnen' : 'Open'}
                  </button>
                ) : (
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0, padding: '4px 8px', borderRadius: 7, background: C.soft }}>
                    {de ? 'Kein Upload' : 'No file'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
