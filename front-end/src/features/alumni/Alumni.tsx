import * as XLSX from 'xlsx';
﻿import React, { useState, useEffect, useMemo } from 'react';
import { translateText } from '../../lib/translateName';
import {
  Users, CheckCircle2, X, Briefcase,
  Building2, Mail, ChevronRight, Award,
  Phone, RefreshCw, Pencil, Download,
} from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../../components/Avatar';
import { Bar2 } from '../../components/Bar';
import { api } from '../../lib/api';

const OUTCOME_LABELS: Record<string, { de: string; en: string; color: string }> = {
  employed:    { de: 'In Beschäftigung', en: 'Employed',     color: C.mint  },
  job_seeking: { de: 'Arbeitssuchend',   en: 'Job-seeking',  color: C.amber },
  education:   { de: 'In Ausbildung',    en: 'In education', color: C.iris  },
  training:    { de: 'In Weiterbildung', en: 'In training',  color: C.iris  },
  other:       { de: 'Sonstiges',        en: 'Other',        color: C.muted },
  unknown:     { de: 'Unbekannt',        en: 'Unknown',      color: C.muted },
};

export default function Alumni() {
  const { lang } = useApp();
  const de = lang === 'de';

  const [measures,      setMeasures]      = useState<any[]>([]);
  const [alumni,        setAlumni]        = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [selAlumnus,    setSelAlumnus]    = useState<any | null>(null);
  const [filterOutcome, setFilterOutcome] = useState('');

  // Edit state
  const [editing,     setEditing]     = useState(false);
  const [editForm,    setEditForm]    = useState<any>({});
  const [editSaving,  setEditSaving]  = useState(false);
  const [filterMeasure, setFilterMeasure] = useState('');
  
  const load = async () => {
    console.log('[Alumni] loading...');
    setLoading(true);
    setError(null);
    try {
      const [parts, placements, measures] = await Promise.all([
        api<any[]>('/participants'),
        api<any[]>('/placement-follow-up').catch(() => []),
        api<any[]>('/measures').catch(() => []),
      ]);

      const partList      = Array.isArray(parts)      ? parts      : [];
      const placementList = Array.isArray(placements)  ? placements : [];
      const measureList   = Array.isArray(measures)    ? measures   : [];
      setMeasures(measureList);
      console.log('[measures]', measureList.map((m) => ({id: m.id, name: m.name})));

      const completed = partList.filter((p) =>
        p.status === 'completed' || p.status === 'abgeschlossen' || p.status === 'dropped'
      );

      const list = completed.map((p) => {
        const pl  = placementList.find((x) =>
          x.participantId === p.id &&
          (x.month === 0 || x.month === null || x.month === undefined)
        );
        const pl6 = placementList.find((x) =>
          x.participantId === p.id && x.month === 6
        );
        const measure = measureList.find((m) =>
          m.id === (p.measureId ?? p.measure?.id)
        );

        return {
          id:       p.id,
          measureId: p.measureId ?? measure?.id ?? null,
          name:     p.name     ?? '—',
          c:        p.c,
          email:    p.email    ?? p.contact ?? '—',
          phone:    p.phone    ?? '—',
          m:        translateText(measure?.name ?? "", lang) ?? p.m ?? p.translateText(measure?.name ?? "", lang) ?? '—',
          grad:     pl?.followUpDate ?? p.updatedAt ?? p.createdAt ?? '—',
          outcome:  pl?.outcome      ?? 'job_seeking',
          employer: pl?.employer     ?? pl?.company   ?? '—',
          jobTitle: pl?.jobTitle     ?? pl?.job       ?? pl?.position ?? '—',
          contract: pl?.contractType ?? '—',
          follow6:  !!pl6,
          consent:  pl?.consentGiven ?? false,
          notes:    pl?.notes        ?? '',
          _plId:    pl?.id           ?? null,
        };
      });

      setAlumni(list);
      console.log('[m fields]', list.slice(0,3).map((a) => a.name + ':' + a.m));
      console.log('[alumni m fields]', list.map((a) => ({ name: a.name, m: a.m, measureId: a.measureId })));
      console.log('[alumni sample]', list[0]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load alumni');
      console.error('[Alumni] load FAILED:', e);
      setAlumni([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ===== Save edit =====
  const saveEdit = async () => {
    if (!selAlumnus) return;
    setEditSaving(true);
    try {
      const payload = {
        outcome:      editForm.outcome,
        employer:     editForm.employer   || undefined,
        jobTitle:     editForm.jobTitle   || undefined,
        contractType: editForm.contract   || undefined,
        consentGiven: editForm.consent,
        notes:        editForm.notes      || undefined,
        followUpDate: editForm.grad       || undefined,
      };

      if (selAlumnus._plId) {
        await api(`/placement-follow-up/${selAlumnus._plId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/placement-follow-up', {
          method: 'POST',
          body: JSON.stringify({
            participantId: selAlumnus.id,
            month: 0,
            followUpDate: editForm.grad || new Date().toLocaleDateString('de-DE'),
            ...payload,
          }),
        });
      }

      setEditing(false);
      setSelAlumnus(null);
      await load();
    } catch (e) {
      console.error(e);
      alert(de ? 'Fehler beim Speichern.' : 'Save failed.');
    } finally { setEditSaving(false); }
  };

  const openEdit = () => {
    setEditForm({
      outcome:  selAlumnus?.outcome  ?? 'job_seeking',
      employer: selAlumnus?.employer !== '—' ? selAlumnus?.employer : '',
      jobTitle: selAlumnus?.jobTitle !== '—' ? selAlumnus?.jobTitle : '',
      contract: selAlumnus?.contract !== '—' ? selAlumnus?.contract : '',
      consent:  selAlumnus?.consent  ?? false,
      grad:     selAlumnus?.grad     !== '—' ? selAlumnus?.grad     : '',
      notes:    selAlumnus?.notes    ?? '',
    });
    setEditing(true);
  };

  const closeModal = () => {
    setSelAlumnus(null);
    setEditing(false);
  };

  // ===== KPIs =====
  const total    = alumni.length;
  const employed = alumni.filter((a) => a.outcome === 'employed').length;
  const seeking  = alumni.filter((a) => a.outcome === 'job_seeking').length;
  const follow6  = alumni.filter((a) => a.follow6).length;
  const intRate  = total ? Math.round((employed / total) * 100) : 0;

  const filtered = alumni.filter((a) => !filterOutcome || a.outcome === filterOutcome);


  const filteredAlumni = alumni.filter((a: any) => {
    if (filterMeasure && a.measureId !== filterMeasure) return false;
    if (filterOutcome && a.outcome !== filterOutcome) return false;
    return true;
  });
  const bootcampNames = useMemo(() => measures.filter((m: any) => m.name), [measures]);

  const exportExcel = () => {
    const rows = filteredAlumni.map((a: any) => ({
      Name: a.name ?? '', Bootcamp: a.measure ?? a.m ?? '',
      Outcome: a.outcome ?? '', Employer: a.employer ?? '',
      Email: a.contact ?? '', Phone: a.phone ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alumni');
    XLSX.writeFile(wb, 'alumni_' + (filterMeasure || 'all') + '.xlsx');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ===== STATS ===== */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          [de ? 'Alumni gesamt'    : 'Total alumni',  total,    C.iris],
          [de ? 'In Beschäftigung': 'Employed',       employed, C.mint],
          [de ? 'Arbeitssuchend'  : 'Job-seeking',    seeking,  C.amber],
          [de ? '6m Follow-up'    : '6m Follow-up',   follow6,  C.iris],
        ].map(([label, val, col]: any, i) => (
          <div key={i} className="card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: col }}>{val}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ===== INTEGRATION RATE ===== */}
      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>
            {de ? 'Integrationsquote' : 'Integration rate'}
          </div>
          <div style={{ fontWeight: 900, fontSize: 20, color: intRate >= 60 ? C.mint : C.amber }}>
            {intRate}%
          </div>
        </div>
        <Bar2 pct={intRate} />
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>
          {de
            ? `Ziel: 60% · ${employed} von ${total} Absolventen in Beschäftigung`
            : `Target: 60% · ${employed} of ${total} alumni employed`}
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="card" style={{ padding: '19px 8px 8px' }}>
        <div className="card-head" style={{ padding: '0 13px 14px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={15} color={C.iris} />
            {de ? 'Absolventen' : 'Alumni'} · {filtered.length}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            </div>
        </div>

        {loading && <div style={{ padding: '0 13px 20px', color: C.muted, fontSize: 13 }}>…</div>}

        {error && <div style={{ padding: '0 13px 20px', color: C.rose, fontSize: 13 }}>⚠️ {error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: '20px 13px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎓</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.inkSoft, marginBottom: 6 }}>
              {de ? 'Noch keine Absolventen' : 'No alumni yet'}
            </div>
            <div style={{ fontSize: 12.5, color: C.muted }}>
              {de
                ? 'Schließe Teilnehmer über Learning Content → Bootcamp ab.'
                : 'Graduate participants via Learning Content → Bootcamp.'}
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="scroll-x">
            
        {/* ===== BOOTCAMP FILTER + EXPORT ===== */}
        <div style={{ display: 'flex', gap: 8, padding: '0 0 12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={filterMeasure} onChange={(e) => setFilterMeasure(e.target.value)}
            style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12.5, outline: 'none', cursor: 'pointer', minWidth: 190 }}>
            <option value="">All Bootcamps </option>
            {bootcampNames.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select value={filterOutcome} onChange={(e) => setFilterOutcome(e.target.value)}
            style={{ padding: '7px 11px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12.5, outline: 'none', cursor: 'pointer', minWidth: 150 }}>
            <option value=""> All Status </option>
            <option value="employed">Employed</option>
            <option value="job_seeking">Job-seeking</option>
            <option value="education">In education</option>
            <option value="training">In training</option>
            <option value="other">Other</option>
            <option value="unknown">Unknown</option>
          </select>

          <button className="btn btn-ghost" style={{ padding: '7px 10px', display: 'flex', alignItems: 'center' }} onClick={load}
            title={de ? 'Aktualisieren' : 'Refresh'}>
            <RefreshCw size={14} color={C.muted} />
          </button>

          {filterMeasure && (
            <button onClick={() => { setFilterMeasure(''); setFilterOutcome(''); }}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: 'none', cursor: 'pointer', fontSize: 12 }}>
              × Clear
            </button>
          )}
          <button onClick={exportExcel} disabled={filteredAlumni.length === 0}
            className='btn btn-ghost' style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', fontSize: 12.5 }}>
            <Download size={14} /> Export Excel {filterMeasure ? '(' + filteredAlumni.length + ')' : '(' + alumni.length + ')'}
          </button>
        </div>

        <table>
              <thead>
                <tr>
                  <th>{de ? 'Name' : 'Name'}</th>
                  <th>Bootcamp</th>
                  <th>{de ? 'Abschluss' : 'Graduated'}</th>
                  <th>{de ? 'Verbleib' : 'Outcome'}</th>
                  <th className="hide-mobile">{de ? 'Arbeitgeber' : 'Employer'}</th>
                  <th className="hide-mobile">6M</th>
                  <th className="hide-mobile">{de ? 'Einwilligung' : 'Consent'}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredAlumni.map((a, i) => {
                  const oc = OUTCOME_LABELS[a.outcome] ?? OUTCOME_LABELS['unknown'];
                  return (
                    <tr key={a.id ?? i} className="row" style={{ cursor: 'pointer' }}
                      onClick={() => { setSelAlumnus(a); setEditing(false); }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar n={a.name} c={a.c} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</div>
                            {a.email !== '—' && (
                              <div style={{ fontSize: 11, color: C.muted }}>{a.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12.5, color: C.inkSoft }}>{a.m || '-'}</td>
                      <td style={{ fontSize: 12, color: C.muted }}>{a.grad}</td>
                      <td>
                        <span className="badge" style={{ background: oc.color + '18', color: oc.color, fontSize: 11 }}>
                          {de ? oc.de : oc.en}
                        </span>
                      </td>
                      <td className="hide-mobile" style={{ fontSize: 12.5 }}>
                        {a.employer !== '—' ? a.employer : <span style={{ color: C.muted }}>—</span>}
                      </td>
                      <td className="hide-mobile">
                        {a.follow6 ? <CheckCircle2 size={15} color={C.mint} /> : <X size={14} color={C.rose} />}
                      </td>
                      <td className="hide-mobile">
                        {a.consent ? <CheckCircle2 size={15} color={C.mint} /> : <X size={14} color={C.rose} />}
                      </td>
                      <td><ChevronRight size={14} color={C.muted} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== DETAIL + EDIT MODAL ===== */}
      {selAlumnus && (
        <div onClick={closeModal} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 440, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editing ? (de ? 'Verbleib bearbeiten' : 'Edit outcome') : selAlumnus.name}
              </div>
              <button onClick={closeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            {/* ===== VIEW MODE ===== */}
            {!editing && (
              <>
                {/* Banner */}
                {(() => {
                  const oc = OUTCOME_LABELS[selAlumnus.outcome] ?? OUTCOME_LABELS['unknown'];
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 12, background: oc.color + '0D', marginBottom: 16 }}>
                      <Avatar n={selAlumnus.name} c={selAlumnus.c} size={44} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 15 }}>{selAlumnus.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{selAlumnus.m}</div>
                      </div>
                      <span className="badge" style={{ background: oc.color + '18', color: oc.color }}>
                        {de ? oc.de : oc.en}
                      </span>
                    </div>
                  );
                })()}

                {/* Detail rows */}
                {([
                  [<Award size={14} />,     de ? 'Abschluss'   : 'Graduated',  selAlumnus.grad],
                  [<Building2 size={14} />, de ? 'Arbeitgeber' : 'Employer',   selAlumnus.employer],
                  [<Briefcase size={14} />, de ? 'Stelle'      : 'Job title',  selAlumnus.jobTitle],
                  [<Mail size={14} />,      'Email',                            selAlumnus.email],
                  [<Phone size={14} />,     de ? 'Telefon'     : 'Phone',      selAlumnus.phone],
                ] as [React.ReactNode, string, string][])
                  .filter(([,, val]) => val && val !== '—')
                  .map(([icon, label, value], i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
                      <div style={{ color: C.muted, marginTop: 1, flexShrink: 0 }}>{icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: C.muted }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
                      </div>
                    </div>
                  ))}

                {/* Follow-up + Consent */}
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <div style={{ flex: 1, padding: '10px 14px', borderRadius: 9, textAlign: 'center', background: selAlumnus.follow6 ? C.mint + '10' : C.rose + '10' }}>
                    {selAlumnus.follow6 ? <CheckCircle2 size={16} color={C.mint} /> : <X size={15} color={C.rose} />}
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>6M Follow-up</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px 14px', borderRadius: 9, textAlign: 'center', background: selAlumnus.consent ? C.mint + '10' : C.rose + '10' }}>
                    {selAlumnus.consent ? <CheckCircle2 size={16} color={C.mint} /> : <X size={15} color={C.rose} />}
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{de ? 'Einwilligung' : 'Consent'}</div>
                  </div>
                </div>

                {selAlumnus.notes && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 9, background: C.soft, fontSize: 12.5, color: C.inkSoft }}>
                    {selAlumnus.notes}
                  </div>
                )}

                {/* Edit button */}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 16, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={openEdit}
                >
                  <Pencil size={14} /> {de ? 'Verbleib bearbeiten' : 'Edit outcome'}
                </button>
              </>
            )}

            {/* ===== EDIT MODE ===== */}
            {editing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Participant info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9, background: C.soft, marginBottom: 4 }}>
                  <Avatar n={selAlumnus.name} c={selAlumnus.c} size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{selAlumnus.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{selAlumnus.m}</div>
                  </div>
                </div>

                <label style={lbl}>{de ? 'Verbleib' : 'Outcome'}
                  <select value={editForm.outcome} onChange={(e) => setEditForm((f: any) => ({ ...f, outcome: e.target.value }))} style={inp}>
                    {Object.entries(OUTCOME_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>{de ? val.de : val.en}</option>
                    ))}
                  </select>
                </label>

                <label style={lbl}>{de ? 'Arbeitgeber' : 'Employer'}
                  <input value={editForm.employer} onChange={(e) => setEditForm((f: any) => ({ ...f, employer: e.target.value }))}
                    style={inp} placeholder={de ? 'z.B. IDS GmbH' : 'e.g. IDS GmbH'} />
                </label>

                <label style={lbl}>{de ? 'Stelle / Position' : 'Job title'}
                  <input value={editForm.jobTitle} onChange={(e) => setEditForm((f: any) => ({ ...f, jobTitle: e.target.value }))}
                    style={inp} placeholder={de ? 'z.B. Data Analyst' : 'e.g. Data Analyst'} />
                </label>

                <label style={lbl}>{de ? 'Vertragsart' : 'Contract type'}
                  <select value={editForm.contract} onChange={(e) => setEditForm((f: any) => ({ ...f, contract: e.target.value }))} style={inp}>
                    <option value="">—</option>
                    <option value="permanent">{de ? 'Unbefristet' : 'Permanent'}</option>
                    <option value="temporary">{de ? 'Befristet' : 'Temporary'}</option>
                    <option value="freelance">{de ? 'Freiberuflich' : 'Freelance'}</option>
                  </select>
                </label>

                <label style={lbl}>{de ? 'Abschlussdatum' : 'Graduation date'}
                  <input value={editForm.grad} onChange={(e) => setEditForm((f: any) => ({ ...f, grad: e.target.value }))}
                    style={inp} placeholder="TT.MM.JJJJ" />
                </label>

                <label style={lbl}>{de ? 'Notizen' : 'Notes'}
                  <textarea value={editForm.notes} onChange={(e) => setEditForm((f: any) => ({ ...f, notes: e.target.value }))}
                    style={{ ...inp, minHeight: 60, resize: 'vertical' }} />
                </label>

                {/* Consent toggle */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                    borderRadius: 9, cursor: 'pointer',
                    background: editForm.consent ? C.mint + '10' : C.soft,
                    border: `1px solid ${editForm.consent ? C.mint : C.line}`,
                    transition: 'all .2s',
                  }}
                  onClick={() => setEditForm((f: any) => ({ ...f, consent: !f.consent }))}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    background: editForm.consent ? C.mint : C.line,
                    display: 'grid', placeItems: 'center',
                    transition: 'background .2s',
                  }}>
                    {editForm.consent && <CheckCircle2 size={13} color="#fff" />}
                  </div>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>
                    {de ? 'Einwilligung zur Kontaktaufnahme' : 'Consent to contact given'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="btn" style={{ flex: 1, padding: '9px', background: C.soft, color: C.inkSoft }}
                    disabled={editSaving} onClick={() => setEditing(false)}>
                    {de ? 'Abbrechen' : 'Cancel'}
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '9px' }}
                    disabled={editSaving} onClick={saveEdit}>
                    {editSaving ? '…' : (de ? 'Speichern' : 'Save')}
                  </button>
                </div>
              </div>
            )}
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


