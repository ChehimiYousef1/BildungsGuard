import React, { useState, useEffect, useRef } from 'react';
import { translateText } from '../../lib/translateName';
import {
  FileText, Plus, X, Upload, Download, CheckCircle2,
  AlertTriangle, Circle, Pencil, Trash2, Shield, Laptop,
  User, Calendar, Tag, Hash, Building2, Clock, Camera,
  ClipboardCheck, Stethoscope, File, Award, BookOpen,
  BarChart2, Star, MapPin, Briefcase, GraduationCap,
  BookMarked, UserX, ScrollText
} from 'lucide-react';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { api, getToken } from '../../lib/api';
import { QM_DOCS } from '../../data/qm';

const API = (import.meta as any).env?.VITE_API_URL ?? '/api';

const DOC_TYPES = [
  { value: 'PARTICIPANT_CONTRACT', de: 'Teilnahmevertrag',          en: 'Participant contract' },
  { value: 'EQUIPMENT_LOAN',       de: 'Geräteüberlassung',         en: 'Equipment loan' },
  { value: 'PRIVACY_CONSENT',      de: 'Datenschutzerklärung',      en: 'Privacy statement' },
  { value: 'MEDIA_CONSENT',        de: 'Einwilligung Medienrechte', en: 'Media consent' },
  { value: 'SICK_NOTE',            de: 'Krankmeldung',              en: 'Sick note' },
  { value: 'CV',                   de: 'Lebenslauf',                en: 'CV / résumé' },
  { value: 'CERTIFICATE',          de: 'Zertifikat',                en: 'Certificate' },
  { value: 'OTHER',                de: 'Sonstiges',                 en: 'Other' },
];

const STATUS_MAP: Record<string, { de: string; en: string; color: string }> = {
  doc_ready:   { de: 'Vollständig',   en: 'Complete',   color: C.mint },
  doc_partial: { de: 'Unvollständig', en: 'Incomplete', color: C.amber },
  doc_manual:  { de: 'Manuell',       en: 'Manual',     color: C.amber },
  doc_missing: { de: 'Fehlt',         en: 'Missing',    color: C.rose },
};

const SCOPES: Record<string, { de: string; en: string }> = {
  full:    { de: 'Vollständig (Name, Kontakt, Bild, Daten)', en: 'Full (name, contact, image, data)' },
  basic:   { de: 'Grundlegend (Name, Kontakt)',               en: 'Basic (name, contact)' },
  minimal: { de: 'Minimal (nur Pflichtfelder)',               en: 'Minimal (required fields only)' },
};

const CONDITIONS: Record<string, { de: string; en: string }> = {
  new:     { de: 'Neu',          en: 'New' },
  good:    { de: 'Gut',          en: 'Good' },
  fair:    { de: 'Befriedigend', en: 'Fair' },
  damaged: { de: 'Beschädigt',   en: 'Damaged' },
};

const MEDIA_LABELS: Record<string, { de: string; en: string }> = {
  photo:  { de: 'Fotos',             en: 'Photos' },
  video:  { de: 'Videos',            en: 'Video' },
  stream: { de: 'Live-Streaming',    en: 'Live streaming' },
  social: { de: 'Social Media',      en: 'Social media' },
  all:    { de: 'Alle Medienrechte', en: 'All media rights' },
};

const EDUCATION_LABELS: Record<string, { de: string; en: string }> = {
  none:        { de: 'Kein Abschluss',      en: 'No qualification' },
  hauptschule: { de: 'Hauptschulabschluss', en: 'Secondary school' },
  realschule:  { de: 'Realschulabschluss',  en: 'Middle school' },
  abitur:      { de: 'Abitur',              en: 'High school' },
  ausbildung:  { de: 'Berufsausbildung',    en: 'Vocational training' },
  bachelor:    { de: 'Bachelor',            en: 'Bachelor' },
  master:      { de: 'Master / Diplom',     en: 'Master / Diploma' },
  promotion:   { de: 'Promotion',           en: 'PhD' },
};

const CERT_LABELS: Record<string, { de: string; en: string }> = {
  completion:    { de: 'Abschlusszertifikat',    en: 'Completion certificate' },
  participation: { de: 'Teilnahmebescheinigung', en: 'Participation certificate' },
  azav:          { de: 'AZAV-Zertifikat',        en: 'AZAV certificate' },
  qualification: { de: 'Qualifikationsnachweis', en: 'Qualification certificate' },
  other:         { de: 'Sonstiges',              en: 'Other' },
};

const RECORD_TYPE_LABELS: Record<string, { de: string; en: string; num: string }> = {
  APTITUDE:          { de: 'Eignungsbeurteilung',      en: 'Aptitude assessment',         num: '#10' },
  COUNSELING:        { de: 'Beratungsprotokoll',        en: 'Counseling record',           num: '#11' },
  INTAKE_FORM:       { de: 'Teilnehmerbogen',           en: 'Participant form',            num: '#12' },
  MEETING_MINUTES:   { de: 'Gesprächsprotokoll',        en: 'Meeting minutes',             num: '#13' },
  LEARNING_GOALS:    { de: 'Lernzielvereinbarung',      en: 'Learning objectives',         num: '#14' },
  SUPPORT_PROOF:     { de: 'Nachweis Einzelförderung',  en: 'Proof of individual support', num: '#15' },
  COACHING_PROGRESS: { de: 'Fortschrittsprotokoll',     en: 'Coaching progress record',    num: '#16' },
  RESULTS:           { de: 'Ergebnisbogen',             en: 'Results sheet',               num: '#18' },
};

const OUTCOME_LABELS: Record<string, { de: string; en: string }> = {
  employed:    { de: 'In Beschäftigung', en: 'Employed' },
  job_seeking: { de: 'Arbeitssuchend',   en: 'Job-seeking' },
  education:   { de: 'In Ausbildung',    en: 'In education' },
  training:    { de: 'In Weiterbildung', en: 'In training' },
  other:       { de: 'Sonstiges',        en: 'Other' },
};

const CONTRACT_LABELS: Record<string, { de: string; en: string }> = {
  permanent:  { de: 'Unbefristet',   en: 'Permanent' },
  temporary:  { de: 'Befristet',     en: 'Temporary' },
  freelance:  { de: 'Freiberuflich', en: 'Freelance' },
};

const DIARY_OUTCOME: Record<string, { de: string; en: string }> = {
  accepted:  { de: 'Angenommen',           en: 'Accepted' },
  rejected:  { de: 'Abgelehnt',            en: 'Rejected' },
  pending:   { de: 'Ausstehend',           en: 'Pending' },
  interview: { de: 'Vorstellungsgespräch', en: 'Interview' },
  withdrawn: { de: 'Zurückgezogen',        en: 'Withdrawn' },
};

const ENROLLMENT_STATUS: Record<string, { de: string; en: string }> = {
  no_show: { de: 'Nicht angetreten', en: 'No-show' },
  dropped: { de: 'Abgebrochen',      en: 'Dropped out' },
};

export default function DocumentModel() {
  const { lang } = useApp();
  const de = lang === 'de';

  const [docs, setDocs]                       = useState<any[]>([]);
  const [equipmentLoans, setEquipmentLoans]   = useState<any[]>([]);
  const [attendanceAll, setAttendanceAll]     = useState<any[]>([]);
  const [participantRecs, setParticipantRecs] = useState<any[]>([]);
  const [surveys, setSurveys]                 = useState<any[]>([]);
  const [evaluations, setEvaluations]         = useState<any[]>([]);
  const [placements, setPlacements]           = useState<any[]>([]);
  const [courseRecords, setCourseRecs]        = useState<any[]>([]);
  const [courses, setCourses]                 = useState<any[]>([]);
  const [courseEvals, setCourseEvals]         = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries]       = useState<any[]>([]);
  const [qmDocs, setQmDocs]                   = useState<any[]>([]);
  const [participants, setParticipants]        = useState<any[]>([]);
  const [measures, setMeasures]                = useState<any[]>([]);
  const [docCategories, setDocCategories]      = useState<any[]>([]); // ✅ NEW
  const [loading, setLoading]                  = useState(true);

  const [open, setOpen]             = useState(false);
  const [saving, setSaving]         = useState(false);
  const [editId, setEditId]         = useState<string | null>(null);
  const [uploading, setUploading]   = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterPart, setFilterPart] = useState('');
  const [formErr, setFormErr]       = useState('');
  const [selDoc, setSelDoc]         = useState<any | null>(null);

  const [form, setForm] = useState({
    type: 'PARTICIPANT_CONTRACT',
    participantId: '',
    measureId: '',
    responsible: '',
    status: 'doc_missing',
  });

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    try {
      // ✅ أضفنا /categories في Promise.all
      const [d, p, m, eq, recs, sv, ev, pl, cr, cs, ce, diary, qm, allCats] = await Promise.all([
        api<any[]>('/documents').catch(() => []),
        api<any[]>('/participants').catch(() => []),
        api<any[]>('/measures').catch(() => []),
        api<any[]>('/equipment-loans').catch(() => []),
        api<any[]>('/participant-records').catch(() => []),
        api<any[]>('/surveys').catch(() => []),
        api<any[]>('/evaluations').catch(() => []),
        api<any[]>('/placement-follow-up').catch(() => []),
        api<any[]>('/course-records').catch(() => []),
        api<any[]>('/courses').catch(() => []),
        api<any[]>('/course-evaluations').catch(() => []),
        api<any[]>('/diary-entries').catch(() => []),
        api<any[]>('/qm-docs').catch(() => []),
        api<any[]>('/categories').catch(() => []),  // ✅ NEW
      ]);

      const partList = Array.isArray(p) ? p : [];
      const attResults = await Promise.all(
        partList.map((pt: any) =>
          api<any[]>(`/attendance/participant/${pt.id}`)
            .then((rows) => rows.map((r: any) => ({ ...r, _participantId: pt.id, _participantName: pt.name })))
            .catch(() => [])
        )
      );

      setDocs(Array.isArray(d) ? d : []);
      setParticipants(partList);
      setMeasures(Array.isArray(m) ? m : []);
      setEquipmentLoans(Array.isArray(eq) ? eq : []);
      setAttendanceAll(attResults.flat());
      setParticipantRecs(Array.isArray(recs) ? recs : []);
      setSurveys(Array.isArray(sv) ? sv : []);
      setEvaluations(Array.isArray(ev) ? ev : []);
      setPlacements(Array.isArray(pl) ? pl : []);
      setCourseRecs(Array.isArray(cr) ? cr.filter((r: any) => r.type === 'TEACHING_LOG') : []);
      setCourses(Array.isArray(cs) ? cs : []);
      setCourseEvals(Array.isArray(ce) ? ce : []);
      setDiaryEntries(Array.isArray(diary) ? diary : []);
      setQmDocs(
        Array.isArray(qm) && qm.length > 0
          ? qm
          : QM_DOCS.map((q: any, i: number) => ({
              id:       `qm-${i}`,
              type:     q.en?.startsWith('Process') ? 'process' : q.en?.startsWith('Form') ? 'form' : 'handbook',
              title:    q.en,
              titleDe:  q.de,
              version:  q.ver,
              author:   q.author,
              approved: q.approved,
              status:   q.status,
            }))
      );
      // ✅ فلتر doc categories فقط
      setDocCategories(Array.isArray(allCats) ? allCats : []);
    } catch { setDocs([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const allDocs = [
    ...docs,
    ...equipmentLoans.map((eq) => ({
      id:            eq.id,
      type:          'EQUIPMENT_LOAN',
      participantId: eq.participantId,
      responsible:   eq.brand ? `${eq.deviceName} · ${eq.brand}` : eq.deviceName,
      status:        eq.returned ? 'doc_ready' : (
        (() => {
          if (!eq.returnDate) return 'doc_missing';
          const [d, m, y] = eq.returnDate.split('.').map(Number);
          return new Date(y, m - 1, d).getTime() < Date.now() ? 'doc_missing' : 'doc_partial';
        })()
      ),
      fileRef:      eq.fileRef ?? null,
      _isEquipment: true,
      _eq:          eq,
    })),
    ...attendanceAll.map((att) => ({
      id:            att.id,
      type:          'ATTENDANCE',
      participantId: att._participantId,
      responsible:   att.session?.title ?? '—',
      status:        att.present || att.status === 'present' ? 'doc_ready'
                   : att.status === 'excused'                ? 'doc_partial'
                   : 'doc_missing',
      fileRef:       null,
      _isAttendance: true,
      _att:          att,
    })),
    ...participantRecs.map((rec) => ({
      id:            rec.id,
      type:          'PARTICIPANT_RECORD',
      participantId: rec.participantId,
      responsible:   rec.author ?? '',
      status:        rec.signed ? 'doc_ready' : rec.content ? 'doc_partial' : 'doc_missing',
      fileRef:       null,
      _isRecord:     true,
      _rec:          rec,
    })),
    ...surveys.map((s) => ({
      id:            s.id,
      type:          'SURVEY',
      participantId: s.participantId,
      responsible:   s.title ?? (s.type === 'test' ? 'Test' : 'Survey'),
      status:        s.score || s.rating ? 'doc_ready' : 'doc_missing',
      fileRef:       null,
      _isSurvey:     true,
      _survey:       s,
    })),
    ...evaluations.map((e) => ({
      id:            e.id,
      type:          'EVALUATION',
      participantId: e.participantId,
      responsible:   e.title ?? '—',
      status:        e.rating ? 'doc_ready' : 'doc_missing',
      fileRef:       null,
      _isEval:       true,
      _eval:         e,
    })),
    ...placements.map((pl) => ({
      id:            pl.id,
      type:          'PLACEMENT',
      participantId: pl.participantId,
      responsible:   pl.employer ?? pl.outcome ?? '—',
      status:        pl.outcome ? 'doc_ready' : 'doc_missing',
      fileRef:       null,
      _isPlacement:  true,
      _pl:           pl,
    })),
    ...courseRecords.map((cr) => ({
      id:            cr.id,
      type:          'COURSE_RECORD',
      participantId: null,
      responsible:   cr.trainer ?? '—',
      status:        cr.topic ? 'doc_ready' : 'doc_missing',
      fileRef:       null,
      _isCourseRec:  true,
      _cr:           cr,
      _courseId:     cr.courseId,
    })),
    ...courseEvals.map((ce) => ({
      id:            ce.id,
      type:          'COURSE_EVAL',
      participantId: null,
      responsible:   ce.period ?? '—',
      status:        ce.overallRating ? 'doc_ready' : 'doc_missing',
      fileRef:       null,
      _isCourseEval: true,
      _ce:           ce,
      _courseId:     ce.courseId,
    })),
    ...diaryEntries.map((diary) => ({
      id:            diary.id,
      type:          'DIARY_ENTRY',
      participantId: diary.participantId,
      responsible:   diary.company ?? diary.title ?? '—',
      status:        diary.outcome ? 'doc_ready' : diary.company ? 'doc_partial' : 'doc_missing',
      fileRef:       null,
      _isDiary:      true,
      _diary:        diary,
    })),
    ...participants
      .filter((pt) => pt.status === 'no_show' || pt.status === 'dropped')
      .map((pt) => ({
        id:            pt.id,
        type:          'ENROLLMENT_STATUS',
        participantId: pt.id,
        responsible:   pt.status,
        status:        'doc_missing',
        fileRef:       null,
        _isEnrollment: true,
        _participant:  pt,
      })),
    ...qmDocs.map((qm) => ({
      id:            qm.id,
      type:          'QM_DOC',
      participantId: null,
      responsible:   qm.author ?? '—',
      status:        qm.status === 'valid' || qm.status === 'doc_ready' ? 'doc_ready'
                   : qm.status === 'inReview' ? 'doc_partial' : 'doc_missing',
      fileRef:       qm.fileRef ?? null,
      _isQmDoc:      true,
      _qm:           qm,
    })),
  ];

  const isAuto = (d: any) =>
    d._isAttendance || d._isRecord  || d._isSurvey  || d._isEval ||
    d._isPlacement  || d._isCourseRec || d._isCourseEval ||
    d._isDiary || d._isEnrollment || d._isQmDoc;

  const complete   = allDocs.filter((d) => d.status === 'doc_ready').length;
  const missing    = allDocs.filter((d) => d.status === 'doc_missing').length;
  const attCount   = allDocs.filter((d) => d.type === 'ATTENDANCE').length;
  const attPresent = allDocs.filter((d) => d.type === 'ATTENDANCE' && d.status === 'doc_ready').length;
  const attRate    = attCount > 0 ? Math.round((attPresent / attCount) * 100) : null;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => {
    setEditId(null);
    setForm({
      type: (!filterType || ['ATTENDANCE','PARTICIPANT_RECORD','SURVEY','EVALUATION','PLACEMENT',
        'COURSE_RECORD','COURSE_EVAL','DIARY_ENTRY','ENROLLMENT_STATUS','QM_DOC'].includes(filterType))
        ? 'PARTICIPANT_CONTRACT' : filterType,
      participantId: '', measureId: '', responsible: '', status: 'doc_missing',
    });
    setFormErr('');
    setOpen(true);
  };

  const openEdit = (d: any) => {
    if (isAuto(d) || d._isEquipment) return;
    setEditId(d.id);
    setForm({
      type:          d.type ?? 'OTHER',
      participantId: d.participantId ?? '',
      measureId:     d.measureId ?? '',
      responsible:   d.responsible ?? '',
      status:        d.status ?? 'doc_missing',
    });
    setFormErr('');
    setOpen(true);
  };

  const submit = async () => {
    setFormErr('');
    if (!form.type) { setFormErr(de ? 'Bitte Typ wählen.' : 'Please select a type.'); return; }
    setSaving(true);
    try {
      const payload: any = {
        type:          form.type,
        responsible:   form.responsible || undefined,
        status:        form.status,
        participantId: form.participantId || undefined,
        measureId:     form.measureId || undefined,
      };
      if (editId) {
        await api(`/documents/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/documents', { method: 'POST', body: JSON.stringify(payload) });
      }
      setOpen(false);
      setLoading(true);
      await load();
    } catch (e: any) {
      setFormErr(e?.message || (de ? 'Fehler beim Speichern.' : 'Save failed.'));
    } finally { setSaving(false); }
  };

  const remove = async (d: any) => {
    if (isAuto(d)) return;
    if (!confirm(de ? 'Dokument löschen?' : 'Delete document?')) return;
    try {
      const token = getToken();
      const url = d._isEquipment ? `${API}/equipment-loans/${d.id}` : `${API}/documents/${d.id}`;
      await fetch(url, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      setSelDoc(null);
      await load();
    } catch (e) { console.error(e); }
  };

  const uploadFile = async (id: string, file: File) => {
    setUploading(id);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/documents/${id}/file`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      await load();
    } catch (e) {
      alert(de ? 'Upload fehlgeschlagen.' : 'Upload failed.');
    } finally { setUploading(null); }
  };

  const downloadFile = async (id: string) => {
    try {
      const data = await api<{ url: string }>(`/documents/${id}/file-url`);
      if (data?.url) window.open(data.url, '_blank');
      else alert(de ? 'Keine Datei vorhanden.' : 'No file available.');
    } catch (e) { console.error(e); }
  };

  const typeLabel = (v: string) => {
    if (v === 'ATTENDANCE')         return de ? 'Anwesenheitsnachweis'     : 'Attendance record';
    if (v === 'PARTICIPANT_RECORD') return de ? 'Coaching-Akte'            : 'Coaching record';
    if (v === 'SURVEY')             return de ? 'Befragung'                : 'Survey';
    if (v === 'EVALUATION')         return de ? 'Bewertung'                : 'Evaluation';
    if (v === 'PLACEMENT')          return de ? 'Verbleib'                 : 'Placement';
    if (v === 'COURSE_RECORD')      return de ? 'Unterrichtsdokumentation' : 'Teaching log';
    if (v === 'COURSE_EVAL')        return de ? 'Maßnahmenbewertung'       : 'Course evaluation';
    if (v === 'DIARY_ENTRY')        return de ? 'Bewerbungstagebuch'       : 'Job diary';
    if (v === 'ENROLLMENT_STATUS')  return de ? 'Nicht-Antritt / Abbruch'  : 'Non-attendance';
    if (v === 'QM_DOC')             return de ? 'QM-Dokument'              : 'QM document';
    // ✅ custom doc categories
    if (v.startsWith('CAT_')) {
      const cat = docCategories.find((c: any) => `CAT_${c.id}` === v);
      return cat?.name ?? v;
    }
    return DOC_TYPES.find((d) => d.value === v)?.[lang as 'de' | 'en'] ?? v;
  };

  const statusLabel = (s: string) => STATUS_MAP[s]?.[lang as 'de' | 'en'] ?? s;
  const statusColor = (s: string) => STATUS_MAP[s]?.color ?? C.muted;

  const statusIcon = (s: string) => {
    if (s === 'doc_ready') return <CheckCircle2 size={16} color={C.mint} />;
    if (s === 'doc_partial' || s === 'doc_manual') return <AlertTriangle size={15} color={C.amber} />;
    return <Circle size={14} color={C.rose} />;
  };

  const typeIcon = (type: string) => {
    if (type === 'EQUIPMENT_LOAN')    return <Laptop         size={14} color={C.iris} />;
    if (type === 'PRIVACY_CONSENT')   return <Shield         size={14} color={C.iris} />;
    if (type === 'MEDIA_CONSENT')     return <Camera         size={14} color={C.iris} />;
    if (type === 'ATTENDANCE')        return <ClipboardCheck size={14} color={C.iris} />;
    if (type === 'SICK_NOTE')         return <Stethoscope    size={14} color={C.iris} />;
    if (type === 'CV')                return <File           size={14} color={C.iris} />;
    if (type === 'CERTIFICATE')       return <Award          size={14} color={C.iris} />;
    if (type === 'PARTICIPANT_RECORD')return <BookOpen       size={14} color={C.iris} />;
    if (type === 'SURVEY')            return <BarChart2      size={14} color={C.iris} />;
    if (type === 'EVALUATION')        return <Star           size={14} color={C.iris} />;
    if (type === 'PLACEMENT')         return <MapPin         size={14} color={C.iris} />;
    if (type === 'COURSE_RECORD')     return <Briefcase      size={14} color={C.iris} />;
    if (type === 'COURSE_EVAL')       return <GraduationCap  size={14} color={C.iris} />;
    if (type === 'DIARY_ENTRY')       return <BookMarked     size={14} color={C.iris} />;
    if (type === 'ENROLLMENT_STATUS') return <UserX          size={14} color={C.rose} />;
    if (type === 'QM_DOC')            return <ScrollText     size={14} color={C.iris} />;
    if (type.startsWith('CAT_'))      return <Tag            size={14} color={C.iris} />;
    return <FileText size={14} color={C.iris} />;
  };

  const filtered = allDocs.filter((d) => {
    if (filterType && d.type !== filterType) return false;
    if (filterPart && d.participantId !== filterPart) return false;
    return true;
  });

  // ===== Detail Modal =====
  const renderDetail = (d: any) => {
    const part   = participants.find((p) => p.id === d.participantId);
    const meas   = measures.find((m) => m.id === d.measureId);
    const signed = d.status === 'doc_ready';

    const row = (icon: React.ReactNode, label: string, value: string) => (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
        <div style={{ color: C.muted, flexShrink: 0, marginTop: 1 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{value || '—'}</div>
        </div>
      </div>
    );

    const stars = (n: number) => (
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {[1,2,3,4,5].map((i) => (
          <span key={i} style={{ color: i <= n ? C.amber : C.line, fontSize: 15 }}>★</span>
        ))}
      </span>
    );

    // QM DOCUMENT
    if (d._isQmDoc) {
      const qm    = d._qm;
      const color = qm.status === 'valid' || qm.status === 'doc_ready' ? C.mint
                  : qm.status === 'inReview' ? C.amber : C.rose;
      const TYPE_ICON: Record<string, string> = { handbook: '📖', process: '⚙️', form: '📋' };
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: color + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: color, display: 'grid', placeItems: 'center' }}>
              <ScrollText size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                {de ? (qm.titleDe ?? qm.title) : (qm.title ?? qm.titleDe)}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>
                {TYPE_ICON[qm.type] ?? '📄'} {qm.type} · {qm.version ?? '—'}
              </div>
            </div>
            <span className="badge" style={{ background: color + '18', color }}>
              {qm.status === 'valid' || qm.status === 'doc_ready' ? (de ? 'Gültig ✅' : 'Valid ✅')
             : qm.status === 'inReview' ? (de ? 'In Prüfung ⚠️' : 'In review ⚠️')
             : (de ? 'Entwurf' : 'Draft')}
            </span>
          </div>
          {qm.version  && row(<Tag size={14} />,      'Version',                             qm.version)}
          {qm.author   && row(<User size={14} />,     de ? 'Verantwortlich' : 'Author',      qm.author)}
          {qm.approved && row(<Calendar size={14} />, de ? 'Genehmigt am' : 'Approved on',   qm.approved)}
          {qm.content  && (
            <div style={{ padding: '8px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{de ? 'Inhalt' : 'Content'}</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>{qm.content}</div>
            </div>
          )}
        </>
      );
    }

    // DIARY ENTRY #9
    if (d._isDiary) {
      const diary  = d._diary;
      const color  = diary.outcome === 'accepted' ? C.mint : diary.outcome ? C.amber : diary.company ? C.amber : C.rose;
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: color + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: color, display: 'grid', placeItems: 'center' }}>
              <BookMarked size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{diary.company || diary.title || (de ? 'Bewerbung' : 'Application')}</div>
              <div style={{ fontSize: 12, color: C.muted }}>#9 · {diary.position ?? '—'}</div>
            </div>
            {diary.outcome && (
              <span className="badge" style={{ background: color + '18', color }}>
                {DIARY_OUTCOME[diary.outcome]?.[lang as 'de'|'en'] ?? diary.outcome}
              </span>
            )}
          </div>
          {row(<User size={14} />,      de ? 'Teilnehmer' : 'Participant',   part?.name ?? '—')}
          {diary.company   && row(<Building2 size={14} />, de ? 'Unternehmen' : 'Company',   diary.company)}
          {diary.position  && row(<Tag size={14} />,       de ? 'Stelle' : 'Position',        diary.position)}
          {diary.appliedAt && row(<Calendar size={14} />,  de ? 'Beworben am' : 'Applied on', diary.appliedAt)}
          {diary.outcome   && row(<FileText size={14} />,  de ? 'Ergebnis' : 'Outcome',       DIARY_OUTCOME[diary.outcome]?.[lang as 'de'|'en'] ?? diary.outcome)}
          {diary.notes     && row(<FileText size={14} />,  de ? 'Notizen' : 'Notes',          diary.notes)}
        </>
      );
    }

    // ENROLLMENT STATUS #17
    if (d._isEnrollment) {
      const pt   = d._participant;
      const isNS = pt.status === 'no_show';
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: C.rose + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: C.rose, display: 'grid', placeItems: 'center' }}>
              <UserX size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{pt.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>#17 · {pt.status}</div>
            </div>
            <span className="badge" style={{ background: C.rose + '18', color: C.rose }}>
              {ENROLLMENT_STATUS[pt.status]?.[lang as 'de'|'en'] ?? pt.status} ⚠️
            </span>
          </div>
          <div style={{ padding: '10px 14px', borderRadius: 9, background: C.rose + '08', border: `1px solid ${C.rose}`, fontSize: 12.5, color: C.rose, marginBottom: 10 }}>
            ⚠️ {de ? 'AZAV-relevant: Dieser Vorfall muss dokumentiert werden.' : 'AZAV-relevant: This incident must be documented.'}
          </div>
          {row(<User size={14} />,     de ? 'Teilnehmer' : 'Participant', pt.name ?? '—')}
          {row(<Tag size={14} />,      de ? 'Status' : 'Status',           ENROLLMENT_STATUS[pt.status]?.[lang as 'de'|'en'] ?? pt.status)}
          {pt.translateText(measure?.name ?? "", lang) && row(<Building2 size={14} />, de ? 'Maßnahme' : 'Bootcamp', pt.translateText(measure.name, lang))}
          {row(<FileText size={14} />, de ? 'Erforderliche Maßnahme' : 'Action required',
            isNS
              ? (de ? 'Schriftliche Begründung + Verbleibsdokumentation erforderlich' : 'Written justification + placement documentation required')
              : (de ? 'Abbruchprotokoll + Verbleibsdokumentation erforderlich' : 'Dropout report + placement documentation required')
          )}
        </>
      );
    }

    // COURSE EVALUATION #25
    if (d._isCourseEval) {
      const ce     = d._ce;
      const course = courses.find((c: any) => c.id === ce.courseId);
      const color  = ce.overallRating ? C.mint : C.amber;
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: color + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: color, display: 'grid', placeItems: 'center' }}>
              <GraduationCap size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{ce.period || (de ? 'Maßnahmenbewertung' : 'Course evaluation')}</div>
              <div style={{ fontSize: 12, color: C.muted }}>#25 · {course?.name ?? '—'}</div>
            </div>
            {ce.overallRating && <span className="badge" style={{ background: C.amber + '18', color: C.amber }}>{ce.overallRating}/5 ★</span>}
          </div>
          {course && row(<BookOpen size={14} />, de ? 'Kurs' : 'Course', course.name)}
          {ce.period && row(<Calendar size={14} />, de ? 'Zeitraum' : 'Period', ce.period)}
          {ce.participantCount > 0 && row(<User size={14} />, de ? 'Teilnehmeranzahl' : 'Participants', String(ce.participantCount))}
          {ce.overallRating && (
            <div style={{ padding: '8px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{de ? 'Bewertungen' : 'Ratings'}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {ce.overallRating && <div><div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{de ? 'Gesamt' : 'Overall'}</div>{stars(ce.overallRating)}</div>}
                {ce.contentRating && <div><div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{de ? 'Inhalt' : 'Content'}</div>{stars(ce.contentRating)}</div>}
                {ce.trainerRating && <div><div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{de ? 'Dozent' : 'Trainer'}</div>{stars(ce.trainerRating)}</div>}
              </div>
            </div>
          )}
          {ce.strengths    && row(<FileText size={14} />, de ? 'Stärken' : 'Strengths',           ce.strengths)}
          {ce.improvements && row(<FileText size={14} />, de ? 'Verbesserungen' : 'Improvements',  ce.improvements)}
          {ce.notes        && row(<FileText size={14} />, de ? 'Notizen' : 'Notes',                ce.notes)}
        </>
      );
    }

    // PLACEMENT #22 #23
    if (d._isPlacement) {
      const pl    = d._pl;
      const color = pl.outcome === 'employed' ? C.mint : pl.outcome ? C.amber : C.rose;
      const num   = pl.month === 0 ? '#22' : '#23';
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: color + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: color, display: 'grid', placeItems: 'center' }}>
              <MapPin size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                {pl.month === 0 ? (de ? 'Verbleib bei Abschluss' : 'Placement at completion') : (de ? '6-Monats-Follow-up' : '6-month follow-up')}
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>{num}</div>
            </div>
            {pl.outcome && <span className="badge" style={{ background: color + '18', color }}>{OUTCOME_LABELS[pl.outcome]?.[lang as 'de'|'en'] ?? pl.outcome}</span>}
          </div>
          {row(<User size={14} />,      de ? 'Teilnehmer' : 'Participant',    part?.name ?? '—')}
          {pl.employer     && row(<Building2 size={14} />, de ? 'Arbeitgeber' : 'Employer',     pl.employer)}
          {pl.jobTitle     && row(<Tag size={14} />,       de ? 'Stelle' : 'Job title',          pl.jobTitle)}
          {pl.contractType && row(<FileText size={14} />,  de ? 'Vertragsart' : 'Contract type', CONTRACT_LABELS[pl.contractType]?.[lang as 'de'|'en'] ?? pl.contractType)}
          {pl.followUpDate && row(<Calendar size={14} />,  de ? 'Datum' : 'Date',                pl.followUpDate)}
          {pl.notes        && row(<FileText size={14} />,  de ? 'Notizen' : 'Notes',             pl.notes)}
          {pl.consentGiven && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: C.mint, fontWeight: 600 }}>
              <CheckCircle2 size={14} /> {de ? 'Einwilligung zur Kontaktaufnahme erteilt' : 'Consent to contact given'}
            </div>
          )}
        </>
      );
    }

    // COURSE RECORD #24
    if (d._isCourseRec) {
      const cr     = d._cr;
      const course = courses.find((c: any) => c.id === cr.courseId);
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: C.iris + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: cr.topic ? C.mint : C.amber, display: 'grid', placeItems: 'center' }}>
              <Briefcase size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{cr.topic || (de ? 'Unterrichtseinheit' : 'Teaching unit')}</div>
              <div style={{ fontSize: 12, color: C.muted }}>#24 · {course?.name ?? '—'}</div>
            </div>
            {cr.hours && <span className="badge" style={{ background: C.iris + '18', color: C.iris }}>{cr.hours} UE</span>}
          </div>
          {course    && row(<BookOpen size={14} />,  de ? 'Kurs' : 'Course',       course.name)}
          {cr.recordDate && row(<Calendar size={14} />, de ? 'Datum' : 'Date',     cr.recordDate)}
          {cr.trainer    && row(<User size={14} />,     de ? 'Dozent' : 'Trainer', cr.trainer)}
          {cr.hours      && row(<Clock size={14} />,    'UE',                      String(cr.hours))}
          {cr.notes      && row(<FileText size={14} />, de ? 'Notizen' : 'Notes',  cr.notes)}
        </>
      );
    }

    // SURVEY #19 #20
    if (d._isSurvey) {
      const s     = d._survey;
      const color = s.score || s.rating ? C.mint : C.amber;
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: color + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: color, display: 'grid', placeItems: 'center' }}>
              <BarChart2 size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{s.title || (s.type === 'test' ? (de ? 'Test' : 'Test') : (de ? 'Befragung' : 'Survey'))}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{s.type === 'test' ? '#20' : '#19'} · {s.type}</div>
            </div>
            {s.score  && <span className="badge" style={{ background: C.mint + '18', color: C.mint }}>{s.score}</span>}
            {s.rating && <span className="badge" style={{ background: C.iris + '18', color: C.iris }}>{s.rating}/{s.maxRating ?? 5} ⭐</span>}
          </div>
          {row(<User size={14} />,     de ? 'Teilnehmer' : 'Participant', part?.name ?? '—')}
          {s.surveyDate && row(<Calendar size={14} />, de ? 'Datum' : 'Date', s.surveyDate)}
          {s.notes      && row(<FileText size={14} />, de ? 'Notizen' : 'Notes', s.notes)}
        </>
      );
    }

    // EVALUATION #21
    if (d._isEval) {
      const e     = d._eval;
      const color = e.rating ? C.mint : C.amber;
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: color + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: color, display: 'grid', placeItems: 'center' }}>
              <Star size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{e.title || (de ? 'Bewertung' : 'Evaluation')}</div>
              <div style={{ fontSize: 12, color: C.muted }}>#21</div>
            </div>
            {e.rating && <span className="badge" style={{ background: C.mint + '18', color: C.mint }}>{e.rating}/5 ⭐</span>}
          </div>
          {row(<User size={14} />,      de ? 'Teilnehmer' : 'Participant',     part?.name ?? '—')}
          {e.evalDate       && row(<Calendar size={14} />,  de ? 'Datum' : 'Date',           e.evalDate)}
          {e.author         && row(<Building2 size={14} />, de ? 'Autor' : 'Author',          e.author)}
          {e.strengths      && row(<FileText size={14} />,  de ? 'Stärken' : 'Strengths',     e.strengths)}
          {e.weaknesses     && row(<FileText size={14} />,  de ? 'Schwächen' : 'Weaknesses',  e.weaknesses)}
          {e.recommendation && row(<FileText size={14} />,  de ? 'Empfehlung' : 'Recommendation', e.recommendation)}
        </>
      );
    }

    // PARTICIPANT RECORD #10-16,18
    if (d._isRecord) {
      const rec    = d._rec;
      const rLabel = RECORD_TYPE_LABELS[rec.type]?.[lang as 'de' | 'en'] ?? rec.type;
      const rNum   = RECORD_TYPE_LABELS[rec.type]?.num ?? '';
      const color  = rec.signed ? C.mint : rec.content ? C.amber : C.rose;
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: color + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: color, display: 'grid', placeItems: 'center' }}>
              <BookOpen size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{rLabel}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{rNum} · {rec.type}</div>
            </div>
            <span className="badge" style={{ background: color + '18', color }}>
              {rec.signed ? (de ? 'Unterzeichnet ✅' : 'Signed ✅')
                : rec.content ? (de ? 'In Bearbeitung' : 'In progress')
                : (de ? 'Leer' : 'Empty')}
            </span>
          </div>
          {row(<User size={14} />,       de ? 'Teilnehmer' : 'Participant', part?.name ?? '—')}
          {rec.title      && row(<Tag size={14} />,       de ? 'Titel' : 'Title',       rec.title)}
          {rec.recordDate && row(<Calendar size={14} />,  de ? 'Datum' : 'Date',         rec.recordDate)}
          {rec.author     && row(<Building2 size={14} />, de ? 'Verfasser' : 'Author',   rec.author)}
          {rec.content    && (
            <div style={{ padding: '8px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{de ? 'Inhalt' : 'Content'}</div>
              <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{rec.content}</div>
            </div>
          )}
          {rec.signed && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: C.mint, fontWeight: 600 }}>
              <CheckCircle2 size={14} /> {de ? 'Unterzeichnet' : 'Signed'}
            </div>
          )}
        </>
      );
    }

    // ATTENDANCE #5
    if (d._isAttendance) {
      const att       = d._att;
      const isPresent = att.present || att.status === 'present';
      const isExcused = att.status === 'excused';
      const color     = isPresent ? C.mint : isExcused ? C.amber : C.rose;
      const label     = isPresent ? (de ? 'Anwesend ✅' : 'Present ✅')
        : isExcused ? (de ? 'Entschuldigt ⚠️' : 'Excused ⚠️')
        : (de ? 'Abwesend ❌' : 'Absent ❌');
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: color + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: color, display: 'grid', placeItems: 'center' }}>
              <ClipboardCheck size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{att.session?.title ?? '—'}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{att.session?.course?.name ?? '—'}</div>
            </div>
            <span className="badge" style={{ background: color + '18', color }}>{label}</span>
          </div>
          {row(<User size={14} />,      de ? 'Teilnehmer' : 'Participant', part?.name ?? att._participantName ?? '—')}
          {row(<Tag size={14} />,       de ? 'Sitzung' : 'Session',        att.session?.title ?? '—')}
          {row(<Building2 size={14} />, de ? 'Kurs' : 'Course',            att.session?.course?.name ?? '—')}
          {row(<Clock size={14} />,     de ? 'Zeit' : 'Time',              att.session?.time ?? '—')}
        </>
      );
    }

    // EQUIPMENT LOAN #2
    if (d._isEquipment) {
      const eq = d._eq;
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: C.iris + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: eq.returned ? C.mint : C.iris, display: 'grid', placeItems: 'center' }}>
              <Laptop size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{eq.deviceName}</div>
              {eq.brand && <div style={{ fontSize: 12, color: C.muted }}>{eq.brand}</div>}
            </div>
            <span className="badge" style={{ background: eq.returned ? C.mint + '18' : C.amber + '18', color: eq.returned ? C.mint : C.amber }}>
              {eq.returned ? (de ? 'Zurückgegeben ✅' : 'Returned ✅') : (de ? 'Ausgeliehen' : 'On loan')}
            </span>
          </div>
          {row(<User size={14} />,     de ? 'Teilnehmer' : 'Participant',              part?.name ?? '—')}
          {row(<Hash size={14} />,     'Serial Number',                                 eq.serialNumber ?? '—')}
          {row(<Tag size={14} />,      de ? 'Zustand' : 'Condition',                   CONDITIONS[eq.condition]?.[lang as 'de'|'en'] ?? eq.condition ?? '—')}
          {row(<Calendar size={14} />, de ? 'Ausgabedatum' : 'Loan date',              eq.loanDate ?? '—')}
          {row(<Clock size={14} />,    de ? 'Rückgabe (geplant)' : 'Return (planned)', eq.returnDate ?? '—')}
          {eq.returnedDate && row(<CheckCircle2 size={14} />, de ? 'Zurückgegeben am' : 'Returned on', eq.returnedDate)}
          {eq.notes && row(<FileText size={14} />, de ? 'Notizen' : 'Notes', eq.notes)}
        </>
      );
    }

    // PRIVACY CONSENT #3
    if (d.type === 'PRIVACY_CONSENT') {
      let extra: any = {};
      try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch { extra = { name: d.responsible }; }
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: signed ? C.mint + '0D' : C.rose + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: signed ? C.mint : C.rose, display: 'grid', placeItems: 'center' }}>
              <Shield size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{de ? 'Datenschutzerklärung' : 'Privacy Statement'}</div>
              {extra.version && <div style={{ fontSize: 12, color: C.muted }}>v{extra.version}</div>}
            </div>
            <span className="badge" style={{ background: signed ? C.mint + '18' : C.rose + '18', color: signed ? C.mint : C.rose }}>
              {signed ? (de ? 'Unterzeichnet ✅' : 'Signed ✅') : (de ? 'Ausstehend ❌' : 'Pending ❌')}
            </span>
          </div>
          {row(<User size={14} />,      de ? 'Teilnehmer' : 'Participant',     part?.name ?? '—')}
          {row(<Tag size={14} />,       'Version',                              extra.version ?? '—')}
          {row(<FileText size={14} />,  de ? 'Umfang' : 'Scope',               SCOPES[extra.scope]?.[lang as 'de'|'en'] ?? extra.scope ?? '—')}
          {row(<Calendar size={14} />,  de ? 'Unterzeichnet am' : 'Signed on', extra.signedDate ?? '—')}
          {row(<Building2 size={14} />, de ? 'Zuständig' : 'Responsible',      extra.name ?? '—')}
        </>
      );
    }

    // MEDIA CONSENT #4
    if (d.type === 'MEDIA_CONSENT') {
      let extra: any = {};
      try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch { extra = { name: d.responsible }; }
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: signed ? C.mint + '0D' : C.rose + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: signed ? C.mint : C.rose, display: 'grid', placeItems: 'center' }}>
              <Camera size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{de ? 'Medienrechte-Einwilligung' : 'Media Rights Consent'}</div>
              {extra.version && <div style={{ fontSize: 12, color: C.muted }}>v{extra.version}</div>}
            </div>
            <span className="badge" style={{ background: signed ? C.mint + '18' : C.rose + '18', color: signed ? C.mint : C.rose }}>
              {signed ? (de ? 'Unterzeichnet ✅' : 'Signed ✅') : (de ? 'Ausstehend ❌' : 'Pending ❌')}
            </span>
          </div>
          {row(<User size={14} />,      de ? 'Teilnehmer' : 'Participant',     part?.name ?? '—')}
          {row(<Tag size={14} />,       'Version',                              extra.version ?? '—')}
          {row(<Calendar size={14} />,  de ? 'Unterzeichnet am' : 'Signed on', extra.signedDate ?? '—')}
          {row(<Building2 size={14} />, de ? 'Zuständig' : 'Responsible',      extra.name ?? '—')}
          {extra.purpose && row(<FileText size={14} />, de ? 'Zweck' : 'Purpose', extra.purpose)}
          {extra.mediaTypes?.length > 0 && (
            <div style={{ padding: '8px 0', borderBottom: `1px solid ${C.lineSoft}` }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{de ? 'Einwilligung für' : 'Consent for'}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {extra.mediaTypes.map((mt: string) => (
                  <span key={mt} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: C.iris + '12', color: C.iris, fontWeight: 600 }}>
                    {MEDIA_LABELS[mt]?.[lang as 'de'|'en'] ?? mt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    // SICK NOTE #6
    if (d.type === 'SICK_NOTE') {
      let extra: any = {};
      try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch { extra = { doctor: d.responsible }; }
      const calcDays = (from: string, to: string) => {
        try {
          const [d1, m1, y1] = from.split('.').map(Number);
          const [d2, m2, y2] = to.split('.').map(Number);
          return Math.ceil((new Date(y2, m2-1, d2).getTime() - new Date(y1, m1-1, d1).getTime()) / 86400000) + 1;
        } catch { return null; }
      };
      const days = extra.dateFrom && extra.dateTo ? calcDays(extra.dateFrom, extra.dateTo) : null;
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: signed ? C.mint + '0D' : C.rose + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: signed ? C.mint : C.rose, display: 'grid', placeItems: 'center' }}>
              <Stethoscope size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                {extra.dateFrom && extra.dateTo ? `${extra.dateFrom} → ${extra.dateTo}` : (de ? 'Krankmeldung' : 'Sick note')}
              </div>
              {days && <div style={{ fontSize: 12, color: C.muted }}>{days} {de ? 'Tage' : 'days'}</div>}
            </div>
            <span className="badge" style={{ background: signed ? C.mint + '18' : C.rose + '18', color: signed ? C.mint : C.rose }}>
              {signed ? (de ? 'Eingereicht ✅' : 'Filed ✅') : (de ? 'Ausstehend ❌' : 'Pending ❌')}
            </span>
          </div>
          {row(<User size={14} />,         de ? 'Teilnehmer' : 'Participant',    part?.name ?? '—')}
          {extra.dateFrom    && row(<Calendar size={14} />,    de ? 'Krank von' : 'Sick from',     extra.dateFrom)}
          {extra.dateTo      && row(<Calendar size={14} />,    de ? 'Krank bis' : 'Sick until',    extra.dateTo)}
          {extra.doctor      && row(<Stethoscope size={14} />, de ? 'Arzt' : 'Doctor',             extra.doctor)}
          {extra.institution && row(<Building2 size={14} />,   de ? 'Einrichtung' : 'Institution', extra.institution)}
          {extra.notes       && row(<FileText size={14} />,    de ? 'Notizen' : 'Notes',           extra.notes)}
        </>
      );
    }

    // CV #7
    if (d.type === 'CV') {
      let extra: any = {};
      try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch { extra = {}; }
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: signed ? C.mint + '0D' : C.amber + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: signed ? C.mint : C.amber, display: 'grid', placeItems: 'center' }}>
              <File size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{de ? 'Lebenslauf' : 'CV / Résumé'}</div>
              {extra.lastUpdated && <div style={{ fontSize: 12, color: C.muted }}>{de ? 'Stand:' : 'Updated:'} {extra.lastUpdated}</div>}
            </div>
            <span className="badge" style={{ background: signed ? C.mint + '18' : C.amber + '18', color: signed ? C.mint : C.amber }}>
              {signed ? (de ? 'Vorhanden ✅' : 'On file ✅') : (de ? 'Ausstehend' : 'Pending')}
            </span>
          </div>
          {row(<User size={14} />,      de ? 'Teilnehmer' : 'Participant',     part?.name ?? '—')}
          {extra.education  && row(<Tag size={14} />,      de ? 'Abschluss' : 'Education',   EDUCATION_LABELS[extra.education]?.[lang as 'de'|'en'] ?? extra.education)}
          {extra.experience && row(<Clock size={14} />,    de ? 'Erfahrung' : 'Experience',  `${extra.experience} ${de ? 'Jahre' : 'years'}`)}
          {extra.languages  && row(<FileText size={14} />, de ? 'Sprachen' : 'Languages',    extra.languages)}
          {extra.skills     && row(<Tag size={14} />,      de ? 'Kenntnisse' : 'Skills',     extra.skills)}
        </>
      );
    }

    // CERTIFICATE #8
    if (d.type === 'CERTIFICATE') {
      let extra: any = {};
      try { extra = d.responsible ? JSON.parse(d.responsible) : {}; } catch { extra = {}; }
      return (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: signed ? C.mint + '0D' : C.amber + '0D', marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: signed ? C.mint : C.amber, display: 'grid', placeItems: 'center' }}>
              <Award size={22} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{extra.title || (de ? 'Zertifikat' : 'Certificate')}</div>
              {extra.certType && <div style={{ fontSize: 12, color: C.muted }}>{CERT_LABELS[extra.certType]?.[lang as 'de'|'en'] ?? extra.certType}</div>}
            </div>
            <span className="badge" style={{ background: signed ? C.mint + '18' : C.amber + '18', color: signed ? C.mint : C.amber }}>
              {signed ? (de ? 'Ausgestellt ✅' : 'Issued ✅') : (de ? 'Ausstehend' : 'Pending')}
            </span>
          </div>
          {row(<User size={14} />,      de ? 'Teilnehmer' : 'Participant',    part?.name ?? '—')}
          {extra.issuedDate && row(<Calendar size={14} />,  de ? 'Ausgestellt am' : 'Issued on',  extra.issuedDate)}
          {extra.issuedBy   && row(<Building2 size={14} />, de ? 'Ausgestellt von' : 'Issued by', extra.issuedBy)}
          {extra.validUntil && row(<Clock size={14} />,     de ? 'Gültig bis' : 'Valid until',    extra.validUntil)}
          {extra.notes      && row(<FileText size={14} />,  de ? 'Notizen' : 'Notes',             extra.notes)}
        </>
      );
    }

    // PARTICIPANT CONTRACT & OTHERS (incl. custom CAT_*)
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12, background: signed ? C.mint + '0D' : C.iris + '0D', marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: signed ? C.mint : C.iris, display: 'grid', placeItems: 'center' }}>
            <FileText size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{typeLabel(d.type)}</div>
            <div style={{ fontSize: 12, color: C.muted }}>{d.type}</div>
          </div>
          <span className="badge" style={{ background: statusColor(d.status) + '18', color: statusColor(d.status) }}>
            {statusLabel(d.status)}
          </span>
        </div>
        {row(<User size={14} />,      de ? 'Teilnehmer' : 'Participant', part?.name ?? '—')}
        {meas && row(<Tag size={14} />, de ? 'Maßnahme' : 'Bootcamp',    meas.name)}
        {row(<Building2 size={14} />, de ? 'Zuständig' : 'Responsible', d.responsible ?? '—')}
        {row(<Calendar size={14} />,  de ? 'Erstellt am' : 'Created',   d.createdAt ? new Date(d.createdAt).toLocaleDateString('de-DE') : '—')}
      </>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>

      {/* ===== 17 CATEGORY CARDS ===== */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { type: 'PARTICIPANT_CONTRACT', icon: <FileText       size={14} color="#fff" />, label: de ? 'Verträge'            : 'Contracts',       color: C.iris  },
          { type: 'EQUIPMENT_LOAN',       icon: <Laptop         size={14} color="#fff" />, label: de ? 'Geräte'              : 'Equipment',       color: C.amber },
          { type: 'PRIVACY_CONSENT',      icon: <Shield         size={14} color="#fff" />, label: de ? 'Datenschutz'         : 'Privacy',         color: C.mint  },
          { type: 'MEDIA_CONSENT',        icon: <Camera         size={14} color="#fff" />, label: de ? 'Medienrechte'        : 'Media',           color: C.iris  },
          { type: 'ATTENDANCE',           icon: <ClipboardCheck size={14} color="#fff" />, label: de ? 'Anwesenheit'         : 'Attendance',      color: C.mint  },
          { type: 'SICK_NOTE',            icon: <Stethoscope    size={14} color="#fff" />, label: de ? 'Krankmeldungen'      : 'Sick notes',      color: C.rose  },
          { type: 'CV',                   icon: <File           size={14} color="#fff" />, label: de ? 'Lebensläufe'         : 'CVs',             color: C.amber },
          { type: 'CERTIFICATE',          icon: <Award          size={14} color="#fff" />, label: de ? 'Zertifikate'         : 'Certificates',    color: C.mint  },
          { type: 'DIARY_ENTRY',          icon: <BookMarked     size={14} color="#fff" />, label: de ? 'Bewerbungstagebuch'  : 'Job diary (#9)',  color: C.iris  },
          { type: 'PARTICIPANT_RECORD',   icon: <BookOpen       size={14} color="#fff" />, label: de ? 'Coaching'            : 'Coaching',        color: C.iris  },
          { type: 'ENROLLMENT_STATUS',    icon: <UserX          size={14} color="#fff" />, label: de ? 'Nicht-Antritt (#17)' : 'No-show (#17)',   color: C.rose  },
          { type: 'SURVEY',               icon: <BarChart2      size={14} color="#fff" />, label: de ? 'Befragungen'         : 'Surveys',         color: C.iris  },
          { type: 'EVALUATION',           icon: <Star           size={14} color="#fff" />, label: de ? 'Bewertungen'         : 'Evaluations',     color: C.amber },
          { type: 'PLACEMENT',            icon: <MapPin         size={14} color="#fff" />, label: de ? 'Verbleib'            : 'Placement',       color: C.mint  },
          { type: 'COURSE_RECORD',        icon: <Briefcase      size={14} color="#fff" />, label: de ? 'Unterricht'          : 'Teaching',        color: C.iris  },
          { type: 'COURSE_EVAL',          icon: <GraduationCap  size={14} color="#fff" />, label: de ? 'Maßnahmenbew.'       : 'Course eval',     color: C.mint  },
          { type: 'QM_DOC',               icon: <ScrollText     size={14} color="#fff" />, label: de ? 'QM-Dokumente'        : 'QM documents',    color: C.iris  },
        ].map((cat) => {
          const count         = allDocs.filter((d) => d.type === cat.type).length;
          const completeCount = allDocs.filter((d) => d.type === cat.type && d.status === 'doc_ready').length;
          const missingCount  = count - completeCount;
          const isActive      = filterType === cat.type;
          return (
            <div key={cat.type} className="card"
              onClick={() => setFilterType(isActive ? '' : cat.type)}
              style={{
                cursor: 'pointer', padding: '11px 10px',
                border: `2px solid ${isActive ? cat.color : C.line}`,
                background: isActive ? cat.color + '0D' : '#fff',
                transition: 'all .2s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: cat.color, display: 'grid', placeItems: 'center' }}>
                  {cat.icon}
                </div>
                {isActive && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: cat.color, background: cat.color + '18', padding: '2px 5px', borderRadius: 20 }}>
                    {de ? 'Aktiv' : 'Active'}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: cat.color, lineHeight: 1 }}>{count}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#334155', marginTop: 3, lineHeight: 1.3 }}>{cat.label}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 9, color: C.mint, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CheckCircle2 size={9} /> {completeCount}
                </span>
                <span style={{ fontSize: 9, color: C.rose, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Circle size={9} /> {missingCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== MINI STATS ===== */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          [de ? 'Gesamt' : 'Total',          allDocs.length, C.iris],
          [de ? 'Vollständig' : 'Complete',   complete,       C.mint],
          [de ? 'Fehlt' : 'Missing',         missing,        C.rose],
          [de ? 'Anwesenheitsrate' : 'Att. rate', attRate !== null ? `${attRate}%` : '—', attRate !== null && attRate >= 80 ? C.mint : C.amber],
        ].map(([label, val, col]: any, i) => (
          <div key={i} className="card" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: col }}>{val}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ===== MAIN TABLE ===== */}
      <div className="card" style={{ padding: '19px 8px 8px' }}>
        <div className="card-head" style={{ padding: '0 13px 14px' }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={15} color={C.iris} />
            {de ? 'AZAV-Dokumente' : 'AZAV Documents'} · {filtered.length}
          </div>
          {!['ATTENDANCE','PARTICIPANT_RECORD','SURVEY','EVALUATION','PLACEMENT',
             'COURSE_RECORD','COURSE_EVAL','DIARY_ENTRY','ENROLLMENT_STATUS','QM_DOC'].includes(filterType) && (
            <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={openNew}>
              <Plus size={14} /> {de ? 'Neu' : 'New'}
            </button>
          )}
        </div>

        {filterType && (
          <div style={{ padding: '0 13px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: C.iris + '18', color: C.iris }}>
              {typeLabel(filterType)} · {filtered.length} {de ? 'Einträge' : 'items'}
            </span>
            <button className="btn btn-ghost" style={{ padding: '3px 9px', fontSize: 11 }}
              onClick={() => setFilterType('')}>
              <X size={11} /> {de ? 'Alle anzeigen' : 'Show all'}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, padding: '0 13px 14px', flexWrap: 'wrap' }}>
          <select value={filterPart} onChange={(e) => setFilterPart(e.target.value)} style={selectSt}>
            <option value="">{de ? '— Alle Teilnehmer —' : '— All participants —'}</option>
            {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {filterPart && (
            <button className="btn btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}
              onClick={() => setFilterPart('')}>
              <X size={12} /> {de ? 'Filter aufheben' : 'Clear'}
            </button>
          )}
        </div>

        {loading && <div style={{ padding: '0 13px 14px', color: C.muted, fontSize: 13 }}>…</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '0 13px 20px', color: C.muted, fontSize: 13 }}>
            {de ? 'Keine Dokumente vorhanden.' : 'No documents yet.'}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>{de ? 'Typ' : 'Type'}</th>
                  <th>{de ? 'Teilnehmer' : 'Participant'}</th>
                  <th className="hide-mobile">{de ? 'Details' : 'Details'}</th>
                  <th>{de ? 'Status' : 'Status'}</th>
                  <th>{de ? 'Datei' : 'File'}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => {
                  const part     = participants.find((p) => p.id === d.participantId);
                  const isEq     = d._isEquipment;
                  const isAtt    = d._isAttendance;
                  const isRec    = d._isRecord;
                  const isSv     = d._isSurvey;
                  const isEv     = d._isEval;
                  const isPl     = d._isPlacement;
                  const isCr     = d._isCourseRec;
                  const isCe     = d._isCourseEval;
                  const isDiary  = d._isDiary;
                  const isEnroll = d._isEnrollment;
                  const isQm     = d._isQmDoc;
                  const autoItem = isAtt || isRec || isSv || isEv || isPl || isCr || isCe || isDiary || isEnroll || isQm;

                  const attColor    = isAtt    ? (d._att?.present || d._att?.status === 'present' ? C.mint : d._att?.status === 'excused' ? C.amber : C.rose) : null;
                  const recColor    = isRec    ? (d._rec?.signed ? C.mint : d._rec?.content ? C.amber : C.rose) : null;
                  const svColor     = isSv     ? (d._survey?.score || d._survey?.rating ? C.mint : C.amber) : null;
                  const evColor     = isEv     ? (d._eval?.rating ? C.mint : C.amber) : null;
                  const plColor     = isPl     ? (d._pl?.outcome === 'employed' ? C.mint : d._pl?.outcome ? C.amber : C.rose) : null;
                  const crColor     = isCr     ? (d._cr?.topic ? C.mint : C.amber) : null;
                  const ceColor     = isCe     ? (d._ce?.overallRating ? C.mint : C.amber) : null;
                  const diaryColor  = isDiary  ? (d._diary?.outcome === 'accepted' ? C.mint : d._diary?.outcome ? C.amber : d._diary?.company ? C.amber : C.rose) : null;
                  const enrollColor = isEnroll ? C.rose : null;
                  const qmColor     = isQm     ? (d._qm?.status === 'valid' || d._qm?.status === 'doc_ready' ? C.mint : d._qm?.status === 'inReview' ? C.amber : C.rose) : null;
                  const rowColor    = attColor ?? recColor ?? svColor ?? evColor ?? plColor ?? crColor ?? ceColor ?? diaryColor ?? enrollColor ?? qmColor;

                  const detailText = () => {
                    if (isAtt)    return d._att?.session?.title ?? '—';
                    if (isEq)     return `${d._eq.deviceName}${d._eq.serialNumber ? ` · ${d._eq.serialNumber}` : ''}`;
                    if (isRec)    return `${RECORD_TYPE_LABELS[d._rec?.type]?.num ?? ''} ${RECORD_TYPE_LABELS[d._rec?.type]?.[lang as 'de'|'en'] ?? '—'}`;
                    if (isSv)     return d._survey?.title ?? (d._survey?.type === 'test' ? 'Test' : 'Survey');
                    if (isEv)     return d._eval?.title ?? (de ? 'Bewertung' : 'Evaluation');
                    if (isPl)     return d._pl?.employer ?? (OUTCOME_LABELS[d._pl?.outcome]?.[lang as 'de'|'en'] ?? '—');
                    if (isCr)     return d._cr?.topic ?? (de ? 'Unterrichtseinheit' : 'Teaching unit');
                    if (isCe)     { const c = courses.find((c: any) => c.id === d._ce?.courseId); return `${c?.name ?? '—'}${d._ce?.period ? ` · ${d._ce.period}` : ''}`; }
                    if (isDiary)  return d._diary?.company ?? d._diary?.position ?? '—';
                    if (isEnroll) return d._participant?.status === 'no_show' ? (de ? 'Nicht angetreten' : 'No-show') : (de ? 'Abgebrochen' : 'Dropped out');
                    if (isQm)     return de ? (d._qm?.titleDe ?? d._qm?.title ?? '—') : (d._qm?.title ?? '—');
                    if (d.type === 'SICK_NOTE') {
                      try { const ex = JSON.parse(d.responsible ?? '{}'); return ex.dateFrom && ex.dateTo ? `${ex.dateFrom} → ${ex.dateTo}` : ex.doctor ?? '—'; }
                      catch { return d.responsible ?? '—'; }
                    }
                    if (d.type === 'CV') {
                      try { const ex = JSON.parse(d.responsible ?? '{}'); return ex.education ? (EDUCATION_LABELS[ex.education]?.[lang as 'de'|'en'] ?? ex.education) : '—'; }
                      catch { return '—'; }
                    }
                    if (d.type === 'CERTIFICATE') {
                      try { const ex = JSON.parse(d.responsible ?? '{}'); return ex.title || (CERT_LABELS[ex.certType]?.[lang as 'de'|'en'] ?? '—'); }
                      catch { return '—'; }
                    }
                    return d.responsible ?? '—';
                  };

                  const badgeLabel = () => {
                    if (isAtt)    return d._att?.present || d._att?.status === 'present' ? (de ? 'Anwesend' : 'Present') : d._att?.status === 'excused' ? (de ? 'Entschuldigt' : 'Excused') : (de ? 'Abwesend' : 'Absent');
                    if (isRec)    return d._rec?.signed ? (de ? 'Unterzeichnet' : 'Signed') : d._rec?.content ? (de ? 'In Bearb.' : 'In progress') : (de ? 'Leer' : 'Empty');
                    if (isSv)     return d._survey?.score || d._survey?.rating ? (de ? 'Ausgefüllt' : 'Filled') : (de ? 'Ausstehend' : 'Pending');
                    if (isEv)     return d._eval?.rating ? (de ? 'Bewertet' : 'Rated') : (de ? 'Ausstehend' : 'Pending');
                    if (isPl)     return d._pl?.outcome ? (OUTCOME_LABELS[d._pl.outcome]?.[lang as 'de'|'en'] ?? d._pl.outcome) : (de ? 'Ausstehend' : 'Pending');
                    if (isCr)     return d._cr?.topic ? (de ? 'Dokumentiert' : 'Documented') : (de ? 'Leer' : 'Empty');
                    if (isCe)     return d._ce?.overallRating ? `${d._ce.overallRating}/5 ★` : (de ? 'Ausstehend' : 'Pending');
                    if (isDiary)  return d._diary?.outcome ? (DIARY_OUTCOME[d._diary.outcome]?.[lang as 'de'|'en'] ?? d._diary.outcome) : (de ? 'Ohne Ergebnis' : 'No outcome');
                    if (isEnroll) return d._participant?.status === 'no_show' ? (de ? 'Nicht angetreten ⚠️' : 'No-show ⚠️') : (de ? 'Abgebrochen ⚠️' : 'Dropped ⚠️');
                    if (isQm)     return d._qm?.status === 'valid' || d._qm?.status === 'doc_ready' ? (de ? 'Gültig' : 'Valid') : d._qm?.status === 'inReview' ? (de ? 'In Prüfung' : 'In review') : (de ? 'Entwurf' : 'Draft');
                    if (isEq && d._eq.returned) return de ? 'Zurückgegeben' : 'Returned';
                    return statusLabel(d.status);
                  };

                  const badgeColor = rowColor ?? statusColor(d.status);

                  return (
                    <tr key={`${d.id}-${i}`} className="row" style={{ cursor: 'pointer' }}
                      onClick={() => setSelDoc(d)}>
                      <td>
                        {rowColor
                          ? (rowColor === C.mint ? <CheckCircle2 size={16} color={C.mint} />
                            : rowColor === C.amber ? <AlertTriangle size={15} color={C.amber} />
                            : <Circle size={14} color={C.rose} />)
                          : statusIcon(d.status)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}>
                          {typeIcon(d.type)}
                          {isRec ? (RECORD_TYPE_LABELS[d._rec?.type]?.[lang as 'de'|'en'] ?? typeLabel(d.type))
                          : isQm  ? (de ? (d._qm?.titleDe ?? d._qm?.title ?? typeLabel(d.type)) : (d._qm?.title ?? typeLabel(d.type)))
                          : typeLabel(d.type)}
                        </div>
                        {isRec    && <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>{RECORD_TYPE_LABELS[d._rec?.type]?.num ?? ''} · Coaching</div>}
                        {isSv     && <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>{d._survey?.type === 'test' ? '#20' : '#19'} · {d._survey?.type}</div>}
                        {isEv     && <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>#21 · evaluation</div>}
                        {isPl     && <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>{d._pl?.month === 0 ? '#22' : '#23'} · placement</div>}
                        {isCr     && <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>#24 · teaching log</div>}
                        {isCe     && <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>#25 · course eval</div>}
                        {isDiary  && <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>#9 · diary</div>}
                        {isEnroll && <div style={{ fontSize: 9.5, color: C.rose,  marginTop: 1 }}>#17 · ⚠️ AZAV</div>}
                        {isQm     && <div style={{ fontSize: 9.5, color: C.muted, marginTop: 1 }}>{d._qm?.type} · {d._qm?.version}</div>}
                      </td>
                      <td style={{ fontSize: 12.5 }}>
                        {part?.name ?? (isAtt ? d._att?._participantName : isEnroll ? d._participant?.name : '—') ?? '—'}
                      </td>
                      <td className="hide-mobile" style={{ fontSize: 12, color: C.muted, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {detailText()}
                      </td>
                      <td>
                        <span className="badge" style={{ background: badgeColor + '18', color: badgeColor, fontSize: 11 }}>
                          {badgeLabel()}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {!autoItem && (d.fileRef ? (
                          <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: 11 }}
                            onClick={() => downloadFile(d.id)}>
                            <Download size={12} /> {de ? 'Öffnen' : 'Open'}
                          </button>
                        ) : !isEq ? (
                          <>
                            <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: 11 }}
                              disabled={uploading === d.id}
                              onClick={() => fileRefs.current[d.id]?.click()}>
                              <Upload size={12} /> {uploading === d.id ? '…' : 'Upload'}
                            </button>
                            <input
                              ref={(el) => { fileRefs.current[d.id] = el; }}
                              type="file" accept=".pdf,.doc,.docx,.png,.jpg"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) uploadFile(d.id, f);
                                e.target.value = '';
                              }}
                            />
                          </>
                        ) : (
                          <span style={{ fontSize: 11, color: C.muted }}>{de ? 'In Akte' : 'In file'}</span>
                        ))}
                        {autoItem && <span style={{ fontSize: 11, color: C.muted }}>{de ? 'Auto' : 'Auto'}</span>}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {!isEq && !autoItem && (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="icon-mini" onClick={() => openEdit(d)}>
                              <Pencil size={13} color={C.muted} />
                            </button>
                            <button className="icon-mini" onClick={() => remove(d)}>
                              <Trash2 size={13} color={C.muted} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===== DETAIL MODAL ===== */}
      {selDoc && (
        <div onClick={() => setSelDoc(null)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 460, padding: 22, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {selDoc._isRecord
                  ? (RECORD_TYPE_LABELS[selDoc._rec?.type]?.[lang as 'de'|'en'] ?? typeLabel(selDoc.type))
                  : selDoc._isQmDoc
                    ? (de ? (selDoc._qm?.titleDe ?? selDoc._qm?.title) : (selDoc._qm?.title ?? selDoc._qm?.titleDe))
                    : typeLabel(selDoc.type)}
              </div>
              <button onClick={() => setSelDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            {renderDetail(selDoc)}

            {!isAuto(selDoc) && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                {selDoc.fileRef ? (
                  <button className="btn btn-primary"
                    style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    onClick={() => downloadFile(selDoc.id)}>
                    <Download size={14} /> {de ? 'Datei öffnen' : 'Open file'}
                  </button>
                ) : !selDoc._isEquipment ? (
                  <>
                    <button className="btn btn-ghost"
                      style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      disabled={uploading === selDoc.id}
                      onClick={() => fileRefs.current[`modal-${selDoc.id}`]?.click()}>
                      <Upload size={14} /> {uploading === selDoc.id ? '…' : (de ? 'Datei hochladen' : 'Upload file')}
                    </button>
                    <input
                      ref={(el) => { fileRefs.current[`modal-${selDoc.id}`] = el; }}
                      type="file" accept=".pdf,.doc,.docx,.png,.jpg"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadFile(selDoc.id, f);
                        e.target.value = '';
                      }}
                    />
                  </>
                ) : (
                  <div style={{ fontSize: 12.5, color: C.muted, padding: '8px 0' }}>
                    {de ? 'Datei wird im Teilnehmerprofil verwaltet.' : 'File managed in participant file.'}
                  </div>
                )}
                {!selDoc._isEquipment && (
                  <button className="btn btn-ghost" style={{ padding: '9px 14px' }}
                    onClick={() => { setSelDoc(null); openEdit(selDoc); }}>
                    <Pencil size={14} /> {de ? 'Bearbeiten' : 'Edit'}
                  </button>
                )}
              </div>
            )}

            {isAuto(selDoc) && (
              <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 9, background: C.soft, fontSize: 12.5, color: C.muted }}>
                {selDoc._isQmDoc
                  ? (de ? 'QM-Dokument wird im QM-Modul verwaltet.' : 'QM document is managed in the QM module.')
                  : (de ? 'Wird im System automatisch verwaltet.' : 'Managed automatically in the system.')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== FORM MODAL ===== */}
      {open && (
        <div onClick={() => !saving && setOpen(false)} style={overlay}>
          <div onClick={(e) => e.stopPropagation()} className="card"
            style={{ width: '100%', maxWidth: 480, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div className="card-title" style={{ fontSize: 16 }}>
                {editId ? (de ? 'Dokument bearbeiten' : 'Edit document') : (de ? 'Neues Dokument' : 'New document')}
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <label style={lbl}>{de ? 'Dokumententyp *' : 'Document type *'}
                <select value={form.type} onChange={(e) => set('type', e.target.value)} style={inp}>
                  {/* Standard types */}
                  {DOC_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>{d[lang as 'de' | 'en']}</option>
                  ))}
                  {/* ✅ Bootcamp categories */}
                  {docCategories.filter((c: any) => c.groupId === 'meas').length > 0 && (
                    <optgroup label={de ? '── Bootcamp-Kategorien ──' : '── Bootcamp categories ──'}>
                      {docCategories.filter((c: any) => c.groupId === 'meas').map((c: any) => (
                        <option key={`CAT_${c.id}`} value={`CAT_${c.id}`}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {/* ✅ Document categories */}
                  {docCategories.filter((c: any) => c.groupId === 'doc').length > 0 && (
                    <optgroup label={de ? '── Dokument-Kategorien ──' : '── Document categories ──'}>
                      {docCategories.filter((c: any) => c.groupId === 'doc').map((c: any) => (
                        <option key={`CAT_${c.id}`} value={`CAT_${c.id}`}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {/* ✅ CAPA categories */}
                  {docCategories.filter((c: any) => c.groupId === 'capa').length > 0 && (
                    <optgroup label={de ? '── CAPA-Kategorien ──' : '── CAPA categories ──'}>
                      {docCategories.filter((c: any) => c.groupId === 'capa').map((c: any) => (
                        <option key={`CAT_${c.id}`} value={`CAT_${c.id}`}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {/* ✅ Audience segments */}
                  {docCategories.filter((c: any) => c.groupId === 'seg').length > 0 && (
                    <optgroup label={de ? '── Zielgruppen ──' : '── Audience segments ──'}>
                      {docCategories.filter((c: any) => c.groupId === 'seg').map((c: any) => (
                        <option key={`CAT_${c.id}`} value={`CAT_${c.id}`}>{c.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </label>

              {['SICK_NOTE', 'CV', 'CERTIFICATE', 'EQUIPMENT_LOAN'].includes(form.type) && (
                <div style={{ padding: '10px 14px', borderRadius: 9, background: C.iris + '0D', border: `1px solid ${C.iris}`, fontSize: 12.5, color: C.iris }}>
                  {form.type === 'SICK_NOTE'    ? (de ? '👉 Details: Teilnehmer → Krankmeldungen'   : '👉 Details: Participant → Sick Notes')
                  : form.type === 'CV'          ? (de ? '👉 Details: Teilnehmer → Lebenslauf'        : '👉 Details: Participant → CV')
                  : form.type === 'CERTIFICATE' ? (de ? '👉 Details: Teilnehmer → Zertifikate'       : '👉 Details: Participant → Certificates')
                  :                               (de ? '👉 Details: Teilnehmer → Geräteüberlassung' : '👉 Details: Participant → Equipment Loan')}
                </div>
              )}

              <label style={lbl}>{de ? 'Teilnehmer' : 'Participant'}
                <select value={form.participantId} onChange={(e) => set('participantId', e.target.value)} style={inp}>
                  <option value="">—</option>
                  {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </label>

              <label style={lbl}>{de ? 'Maßnahme' : 'Bootcamp'}
                <select value={form.measureId} onChange={(e) => set('measureId', e.target.value)} style={inp}>
                  <option value="">—</option>
                  {measures.map((m) => <option key={m.id} value={m.id}>{translateText(m.name, lang)}</option>)}
                </select>
              </label>

              <label style={lbl}>{de ? 'Zuständig / Info' : 'Responsible / Info'}
                <input value={form.responsible} onChange={(e) => set('responsible', e.target.value)}
                  style={inp} placeholder={de ? 'z.B. Verwaltung…' : 'e.g. Admin…'} />
              </label>

              <label style={lbl}>{de ? 'Status' : 'Status'}
                <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inp}>
                  <option value="doc_missing">{de ? 'Fehlt' : 'Missing'}</option>
                  <option value="doc_partial">{de ? 'Unvollständig' : 'Incomplete'}</option>
                  <option value="doc_manual">{de ? 'Manuell' : 'Manual'}</option>
                  <option value="doc_ready">{de ? 'Vollständig' : 'Complete'}</option>
                </select>
              </label>

              {formErr && <div style={{ fontSize: 12, color: C.rose }}>{formErr}</div>}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn" style={{ padding: '9px 16px', background: C.soft, color: C.inkSoft }}
                  disabled={saving} onClick={() => setOpen(false)}>
                  {de ? 'Abbrechen' : 'Cancel'}
                </button>
                <button className="btn btn-primary" style={{ padding: '9px 16px' }}
                  disabled={saving} onClick={submit}>
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
const selectSt: React.CSSProperties = {
  padding: '8px 11px', borderRadius: 9, border: '1px solid #E2E8F0',
  fontSize: 12.5, outline: 'none', cursor: 'pointer', minWidth: 160,
};



