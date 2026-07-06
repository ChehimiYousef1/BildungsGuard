import React, { useState, useEffect } from 'react';
import { translateText } from '../../lib/translateName';
import { CheckCircle2, AlertTriangle, X, Circle, Download, ArrowLeft, FileCheck2 } from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { Badge } from '../../components/Badge';
import { Bar2 } from '../../components/Bar';
import { api, getToken } from '../../lib/api';
import ParticipantRecords from './ParticipantRecords';
import DiaryEntries from './DiaryEntries';
import Surveys from './Surveys';
import Evaluations from './Evaluations';
import PlacementFollowUp from './PlacementFollowUp';
import EquipmentLoan from './EquipmentLoan';
import PrivacyConsent from './PrivacyConsent';
import MediaConsent from './MediaConsent';
import AttendanceRecord from './AttendanceRecord';
import SickNote from './SickNote';
import CVDocument from './CV';
import CertificateDoc from './Certificate';
import EnrollmentStatus from './EnrollmentStatus';
import CourseTeachingLog from './CourseTeachingLog';

export default function Akte({ t0, back }: any) {
  const { t, lang } = useApp();
  const de = lang === 'de';

  const [participant, setParticipant] = useState<any>(t0);
  const [docs, setDocs]               = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selDoc, setSelDoc]           = useState<any | null>(null);
  const [updatingDoc, setUpdatingDoc] = useState(false);

  const akte    = participant?.fileCompleteness ?? participant?.akte ?? 0;
  const Bootcamp = translateText(participant?.measure?.name ?? participant?.measureName ?? participant?.m ?? "", lang) || "—";
  const contact = participant?.contact ?? participant?.ag ?? '—';
  const funding = participant?.fundingType ?? participant?.fund ?? '—';
  const agency  = participant?.agency ?? '—';

  const reloadParticipant = async () => {
    try {
      if (participant?.id) {
        const fresh = await api<any>(`/participants/${participant.id}`);
        if (fresh) setParticipant(fresh);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    (async () => {
      try {
        if (t0?.id) {
          const data = await api<any[]>(`/documents/participant/${t0.id}`);
          setDocs(Array.isArray(data) ? data : []);
        } else { setDocs([]); }
      } catch { setDocs([]); }
      finally { setLoadingDocs(false); }
    })();
  }, [t0?.id]);

  const downloadPdf = async (kind: 'certificate' | 'ergebnisbogen') => {
    if (!participant?.id) return;
    setDownloading(kind);
    try {
      const token = getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? '/api'}/pdf/${kind}/${participant.id}`,
        { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const blob = await res.blob();
      const el = document.createElement('a');
      el.href = URL.createObjectURL(blob);
      el.download = `${kind}-${participant.name}.pdf`;
      el.click();
      URL.revokeObjectURL(el.href);
    } catch (e) {
      console.error('pdf download failed', e);
      alert(de ? 'PDF-Erstellung fehlgeschlagen.' : 'PDF generation failed.');
    } finally { setDownloading(null); }
  };

  const updateDocStatus = async (status: string) => {
    if (!selDoc) return;
    setUpdatingDoc(true);
    try {
      await api(`/documents/${selDoc.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setDocs((ds) => ds.map((d) => d.id === selDoc.id ? { ...d, status } : d));
      setSelDoc((d: any) => ({ ...d, status }));
    } catch (e) { console.error('update doc failed', e); }
    finally { setUpdatingDoc(false); }
  };

  const di = (s: string) =>
    s === 'doc_ready'
      ? <CheckCircle2 size={18} color={C.mint} />
      : s === 'doc_partial' || s === 'doc_manual'
        ? <AlertTriangle size={17} color={C.amber} />
        : s === 'doc_missing'
          ? <X size={16} color={C.rose} />
          : <Circle size={14} color={C.mutedLight} />;

  return (
    <div>
      <button className="back" onClick={back}>
        <ArrowLeft size={15} /> {t('back_list')}
      </button>

      {/* ===== HEADER ===== */}
      <div className="detail-head">
        <Avatar n={participant?.name} c={participant?.c} size={52} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 className="disp" style={{ fontSize: 23, fontWeight: 700 }}>{participant?.name}</h2>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 3 }}>{Bootcamp} · {contact}</div>
          <div style={{ marginTop: 9, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge s={participant?.status} />
            <span className="badge" style={{ background: C.soft, color: C.inkSoft }}>
              {t('file_complete').replace('{x}', String(akte))}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" disabled={downloading !== null}
            onClick={() => downloadPdf('certificate')}>
            <Download size={16} />
            {downloading === 'certificate' ? '…' : (de ? 'Zertifikat' : 'Certificate')}
          </button>
          <button className="btn btn-primary" disabled={downloading !== null}
            onClick={() => downloadPdf('ergebnisbogen')}>
            <Download size={16} />
            {downloading === 'ergebnisbogen' ? '…' : (de ? 'Ergebnisbogen' : 'Results sheet')}
          </button>
        </div>
      </div>

      {/* ===== DOCUMENTS + FUNDING ===== */}
      <div className="grid" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">{t('documents')} · {docs.length}</div>
          </div>
          {loadingDocs && <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>…</div>}
          {!loadingDocs && docs.length === 0 && (
            <div style={{ padding: 14, color: C.muted, fontSize: 13 }}>0</div>
          )}
          {!loadingDocs && docs.map((d, i) => (
            <div key={d.id ?? i} className="doc-row" style={{ cursor: 'pointer' }}
              onClick={() => setSelDoc(d)}>
              {di(d.status)}
              <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{d.type}</div>
              <Badge s={d.status} />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div className="card">
            <div className="card-title" style={{ fontSize: 14, marginBottom: 12 }}>{t('funding')}</div>
            {[
              [t('f_type'),  funding],
              [t('f_no'),    participant?.voucher ?? '—'],
              [t('f_body'),  agency],
              [t('f_valid'), participant?.voucherValidUntil ?? '—'],
            ].map(([k, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12.5 }}>
                <span style={{ color: C.muted }}>{k}</span>
                <span className="mono" style={{ fontWeight: 500, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ fontSize: 14, marginBottom: 12 }}>{t('att_verbleib')}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>{de ? 'Vollständigkeit' : 'Completeness'}</span>
              <span className="mono" style={{ fontWeight: 600, color: C.mint }}>{akte}%</span>
            </div>
            <Bar2 pct={akte} />
          </div>
        </div>
      </div>

      {/* ===== ALL SECTIONS — 25 AZAV docs ===== */}

      {/* #17 — Non-attendance / withdrawal */}
      {participant?.id && (
        <EnrollmentStatus participant={participant} onUpdate={reloadParticipant} />
      )}

      {/* #5 — Individual attendance record */}
      {participant?.id && <AttendanceRecord participantId={participant.id} />}

      {/* #10-16, 18 — ParticipantRecords (Coaching) */}
      {participant?.id && (
        <div style={{ marginTop: 15 }}>
          <ParticipantRecords participantId={participant.id} />
        </div>
      )}

      {/* #9 — Job application diary */}
      {participant?.id && (
        <div style={{ marginTop: 15 }}>
          <DiaryEntries participantId={participant.id} />
        </div>
      )}

      {/* #19-20 — Surveys + Tests */}
      {participant?.id && (
        <div style={{ marginTop: 15 }}>
          <Surveys participantId={participant.id} />
        </div>
      )}

      {/* #21 — Evaluation */}
      {participant?.id && (
        <div style={{ marginTop: 15 }}>
          <Evaluations participantId={participant.id} />
        </div>
      )}

      {/* #22-23 — Placement + 6-month follow-up */}
      {participant?.id && <PlacementFollowUp participantId={participant.id} />}

      {/* #24 — Teaching documentation (per course in Bootcamp) */}
      {participant?.id && <CourseTeachingLog participant={participant} />}

      {/* #2 — Equipment loan */}
      {participant?.id && <EquipmentLoan participantId={participant.id} />}

      {/* #3 — Privacy statement */}
      {participant?.id && <PrivacyConsent participantId={participant.id} />}

      {/* #4 — Media consent */}
      {participant?.id && <MediaConsent participantId={participant.id} />}

      {/* #6 — Sick notes */}
      {participant?.id && <SickNote participantId={participant.id} />}

      {/* #7 — CV */}
      {participant?.id && <CVDocument participantId={participant.id} />}

      {/* #8 — Certificate */}
      {participant?.id && <CertificateDoc participantId={participant.id} />}

      {/* ===== DOCUMENT MODAL ===== */}
      {selDoc && (
        <div onClick={() => !updatingDoc && setSelDoc(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16,
        }}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 420, padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>{selDoc.type}</div>
              <button onClick={() => setSelDoc(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '8px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
                <span style={{ color: C.muted }}>Status</span>
                <Badge s={selDoc.status} />
              </div>
              {selDoc.responsible && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                  <span style={{ color: C.muted }}>{de ? 'Verantwortlich' : 'Responsible'}</span>
                  <span style={{ fontWeight: 500 }}>{selDoc.responsible}</span>
                </div>
              )}
              {selDoc.fileRef ? (
                <button className="btn btn-ghost"
                  onClick={() => window.open(selDoc.fileRef, '_blank', 'noreferrer')}
                  style={{ width: '100%', padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <FileCheck2 size={15} /> {de ? 'Datei öffnen' : 'Open file'}
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: 10, fontSize: 12.5, color: C.muted, background: C.soft, borderRadius: 8 }}>
                  {de ? 'Keine Datei hochgeladen.' : 'No file uploaded.'}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {selDoc.status !== 'doc_ready' && (
                  <button className="btn btn-primary"
                    style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    disabled={updatingDoc} onClick={() => updateDocStatus('doc_ready')}>
                    <CheckCircle2 size={14} /> {de ? 'Als erledigt' : 'Mark ready'}
                  </button>
                )}
                {selDoc.status !== 'doc_missing' && (
                  <button className="btn"
                    style={{ flex: 1, padding: '9px', background: C.soft, color: C.inkSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    disabled={updatingDoc} onClick={() => updateDocStatus('doc_missing')}>
                    <X size={14} /> {de ? 'Fehlt' : 'Missing'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



