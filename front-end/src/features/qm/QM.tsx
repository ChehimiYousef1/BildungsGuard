import React, { useState, useEffect, useRef } from 'react';
import { translateText } from '../../lib/translateName';
import {
  TrendingUp, Plus, AlertTriangle, Check, CheckCircle2,
  FileText, BadgeCheck, X, Pencil, Trash2, Eye, Download,
  Upload, Users, GraduationCap, BookOpen, BarChart2,
  ClipboardCheck, UserX, Award, Building2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { C } from '../../theme/tokens';
import { useApp } from '../../context/AppContext';
import { Bar2 } from '../../components/Bar';
import { Badge } from '../../components/Badge';
import { Avatar } from '../../components/Avatar';
import { api, getToken } from '../../lib/api';
import { INIT_PART }              from '../../data/participants';
import { DOZENTEN }               from '../../data/trainers';
import { INIT_ALUMNI }            from '../../data/alumni';
import { PART_DOCS, COURSE_DOCS } from '../../data/documents';
import { AUDIT_HIST }             from '../../data/audit';
import { KPIS, QM_DOCS, PROC_EV, INIT_COMPLAINTS, INT_AUDITS } from '../../data/qm';
import { MASSNAHMEN }             from '../../data/measures';

const API_URL = (import.meta as any).env?.VITE_API_URL ?? '/api';

export default function QM() {
  const { lang } = useApp();
  const de = lang === 'de';

  const [tab, setTab] = useState('kpi');

  const [apiParts,    setApiParts]    = useState<any[]>([]);
  const [apiAlumni,   setApiAlumni]   = useState<any[]>([]);
  const [apiDocs,     setApiDocs]     = useState<any[]>([]);
  const [apiTrainers, setApiTrainers] = useState<any[]>([]);
  const [capaRows,    setCapaRows]    = useState<any[]>([]);
  const [qmDocs,      setQmDocs]      = useState<any[]>([]);
  const [apiAudits,   setApiAudits]   = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);

  const [open,      setOpen]      = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState<any>({ type: 'process', title: '', content: '', owner: '', version: '', status: 'doc_ready' });
  const [viewDoc,   setViewDoc]   = useState<any | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileUploadRef             = useRef<Record<string, HTMLInputElement | null>>({});

  const [capaOpen,   setCapaOpen]   = useState(false);
  const [capaSaving, setCapaSaving] = useState(false);
  const [capaEditId, setCapaEditId] = useState<string | null>(null);
  const [capaForm,   setCapaForm]   = useState<any>({ date: '', source: 'Complaint', description: '', category: '', owner: '', dueDate: '', status: 'open' });

  const loadQm = async () => {
    const dc = await api<any[]>('/qm-docs').catch(() => []);
    setQmDocs(Array.isArray(dc) && dc.length > 0 ? dc : QM_DOCS.map((q: any, i: number) => ({
      id: `qm-${i}`,
      type: q.en?.startsWith('Process') ? 'process' : q.en?.startsWith('Form') ? 'form' : 'handbook',
      title: q.en, titleDe: q.de, version: q.ver, author: q.author, approved: q.approved, status: q.status,
    })));
  };

  const loadCapa = async () => {
    const c = await api<any[]>('/capa').catch(() => []);
    setCapaRows(Array.isArray(c) && c.length > 0 ? c : INIT_COMPLAINTS.map((c: any, i: number) => ({
      id: `capa-${i}`, date: c.date, source: c.src, description: c.desc,
      descriptionEn: c.descEn, category: c.cat, owner: c.owner, dueDate: c.due, status: c.status,
    })));
  };

  useEffect(() => {
    (async () => {
      try {
        const [p, al, docList, tr, ex] = await Promise.all([
          api<any[]>('/participants').catch(() => []),
          api<any[]>('/alumni').catch(() => []),
          api<any[]>('/documents').catch(() => []),
          api<any[]>('/trainers').catch(() => []),
          api<any[]>('/audit/external').catch(() => []),
        ]);
        setApiParts(Array.isArray(p) && p.length > 0 ? p : INIT_PART.map((x, i) => ({ id: `p-${i}`, ...x })));
        setApiAlumni(Array.isArray(al) && al.length > 0 ? al : INIT_ALUMNI.map((x, i) => ({ id: `al-${i}`, ...x })));
        setApiDocs(Array.isArray(docList) && docList.length > 0 ? docList : PART_DOCS.map((x, i) => ({ id: `d-${i}`, type: x.en, status: x.s })));
        setApiTrainers(Array.isArray(tr) && tr.length > 0 ? tr : DOZENTEN.map((x, i) => ({ id: `t-${i}`, name: x.name, qualificationArea: x.mde, qualificationStatus: x.status, expiry: x.ede })));
        setApiAudits(Array.isArray(ex) && ex.length > 0 ? ex : AUDIT_HIST.map((x, i) => ({ id: `a-${i}`, ...x })));
        await loadQm();
        await loadCapa();
      } finally { setLoading(false); }
    })();
  }, []);

  // ===== KPIs =====
  const totalAlumni     = apiAlumni.length;
  const employed        = apiAlumni.filter((a) => a.outcome === 'employed').length;
  const integrationRate = totalAlumni ? Math.round((employed / totalAlumni) * 100) : 0;
  const totalParts      = apiParts.length;
  const dropped         = apiParts.filter((p) => p.status === 'dropped').length;
  const dropoutRate     = totalParts ? Math.round((dropped / totalParts) * 100) : 0;
  const completedParts  = apiParts.filter((p) => p.status === 'completed').length;
  const passRate        = totalParts ? Math.round((completedParts / totalParts) * 100) : 0;
  const openCapa        = capaRows.filter((c) => c.status === 'open').length;
  const docsReady       = apiDocs.filter((d) => d.status === 'doc_ready').length;
  const docsIncomplete  = apiDocs.filter((d) => d.status !== 'doc_ready').length;
  const trainerOk       = apiTrainers.filter((t) => t.qualificationStatus === 'complete').length;
  const follow6Done     = apiAlumni.filter((a) => a.follow6).length;

  const kpis = [
    { de: 'Integrationsquote', en: 'Integration rate', val: `${integrationRate}%`, pct: integrationRate, tde: 'Ziel 60%',       ten: 'Target 60%',       color: integrationRate >= 60 ? C.mint : C.rose },
    { de: 'Abbruchquote',      en: 'Dropout rate',     val: `${dropoutRate}%`,     pct: dropoutRate,     tde: 'Ziel unter 20%', ten: 'Target under 20%', color: dropoutRate < 20 ? C.mint : C.rose },
    { de: 'Bestehensquote',    en: 'Pass rate',         val: `${passRate}%`,        pct: passRate,        tde: 'Ziel 80%',       ten: 'Target 80%',       color: passRate >= 80 ? C.mint : C.amber },
    { de: 'Offene CAPA',       en: 'Open CAPA',         val: `${openCapa}`,         pct: Math.min(openCapa * 20, 100), tde: 'Ziel 0', ten: 'Target 0', color: openCapa === 0 ? C.mint : C.rose },
  ];

  // ===== QM Doc actions =====
  const openCreate  = () => { setEditId(null); setForm({ type: 'process', title: '', content: '', owner: '', version: '', status: 'doc_ready' }); setOpen(true); };
  const openEditDoc = (d: any) => { setEditId(d.id); setForm({ type: d.type ?? 'process', title: d.title ?? '', content: d.content ?? '', owner: d.owner ?? '', version: d.version ?? '', status: d.status ?? 'doc_ready' }); setOpen(true); };
  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = { type: form.type, title: form.title.trim(), content: form.content.trim() || undefined, owner: form.owner.trim() || undefined, version: form.version.trim() || undefined, status: form.status };
    try {
      if (editId) await api(`/qm-docs/${editId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      else        await api('/qm-docs',            { method: 'POST',  body: JSON.stringify(payload) });
      setOpen(false); await loadQm();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const removeDoc = async (id: string) => {
    if (!confirm(de ? 'Dokument löschen?' : 'Delete document?')) return;
    try { const token = getToken(); await fetch(`${API_URL}/qm-docs/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined }); await loadQm(); }
    catch (e) { console.error(e); }
  };

  const downloadQmDoc = async (doc: any) => {
    if (doc.fileRef) { window.open(doc.fileRef, '_blank'); return; }
    try { const data = await api<{ url: string }>(`/qm-docs/${doc.id}/file-url`); if (data?.url) window.open(data.url, '_blank'); else alert(de ? 'Keine Datei.' : 'No file.'); }
    catch { alert(de ? 'Keine Datei.' : 'No file.'); }
  };

  const uploadQmDoc = async (id: string, file: File) => {
    setUploading(id);
    try {
      const token = getToken(); const fd = new FormData(); fd.append('file', file);
      const res = await fetch(`${API_URL}/qm-docs/${id}/file`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: fd });
      if (!res.ok) throw new Error(); await loadQm();
    } catch { alert(de ? 'Upload fehlgeschlagen.' : 'Upload failed.'); }
    finally { setUploading(null); }
  };

  const typeLabel = (ty: string) =>
    ty === 'form' ? (de ? 'Formular' : 'Form') :
    ty === 'handbook' ? (de ? 'Handbuch' : 'Handbook') :
    (de ? 'Prozess' : 'Process');

  // ===== CAPA actions =====
  const capaSet        = (k: string, v: string) => setCapaForm((f: any) => ({ ...f, [k]: v }));
  const openCapaCreate = () => { setCapaEditId(null); setCapaForm({ date: new Date().toLocaleDateString('de-DE'), source: 'Complaint', description: '', category: '', owner: '', dueDate: '', status: 'open' }); setCapaOpen(true); };
  const openCapaEdit   = (c: any) => { setCapaEditId(c.id); setCapaForm({ date: c.date ?? '', source: c.source ?? 'Complaint', description: c.description ?? c.desc ?? '', category: c.category ?? c.cat ?? '', owner: c.owner ?? '', dueDate: c.dueDate ?? c.due ?? '', status: c.status ?? 'open' }); setCapaOpen(true); };

  const submitCapa = async () => {
    if (!capaForm.description.trim()) return;
    setCapaSaving(true);
    const payload = { date: capaForm.date || undefined, source: capaForm.source || undefined, description: capaForm.description.trim(), category: capaForm.category || undefined, owner: capaForm.owner || undefined, dueDate: capaForm.dueDate || undefined, status: capaForm.status };
    try {
      if (capaEditId) await api(`/capa/${capaEditId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      else            await api('/capa',                { method: 'POST',  body: JSON.stringify(payload) });
      setCapaOpen(false); await loadCapa();
    } catch (e) { console.error(e); }
    finally { setCapaSaving(false); }
  };

  const removeCapa = async (id: string) => {
    if (!confirm(de ? 'Fall löschen?' : 'Delete case?')) return;
    try { const token = getToken(); await fetch(`${API_URL}/capa/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined }); await loadCapa(); }
    catch (e) { console.error(e); }
  };

  const capaColor = (s: string) => s === 'closed' ? C.mint : s === 'in_progress' ? C.amber : s === 'overdue' ? C.rose : C.muted;
  const capaLabel = (s: string) => ({ open: de ? 'Offen' : 'Open', in_progress: de ? 'In Bearbeitung' : 'In progress', closed: de ? 'Geschlossen' : 'Closed', overdue: de ? 'Überfällig' : 'Overdue' }[s] ?? s);

  // ===== EXCEL EXPORTS =====
  const fileDate = () => new Date().toLocaleDateString('de-DE').replace(/\./g, '-');

  const exportSheet = (data: any[], sheetName: string, fileName: string) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), sheetName);
    XLSX.writeFile(wb, `${fileName}_${fileDate()}.xlsx`);
  };

  const exportAllToExcel = () => {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { KPI: de ? 'Integrationsquote'     : 'Integration rate',  Value: `${integrationRate}%`, Target: '60%' },
      { KPI: de ? 'Abbruchquote'          : 'Dropout rate',      Value: `${dropoutRate}%`,     Target: '< 20%' },
      { KPI: de ? 'Bestehensquote'        : 'Pass rate',         Value: `${passRate}%`,         Target: '80%' },
      { KPI: de ? 'Offene CAPA'           : 'Open CAPA',         Value: `${openCapa}`,          Target: '0' },
      { KPI: de ? 'Dokumente vollständig' : 'Docs complete',     Value: `${docsReady}/${apiDocs.length}`, Target: '100%' },
      { KPI: de ? 'Trainer qualifiziert'  : 'Trainers OK',       Value: `${trainerOk}/${apiTrainers.length}`, Target: '100%' },
      { KPI: de ? '6-Monats Follow-up'    : '6M Follow-up',      Value: `${follow6Done}/${totalAlumni}`, Target: '100%' },
    ]), 'KPIs');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(qmDocs.map((d) => ({
      [de ? 'Titel' : 'Title']: de ? (d.titleDe ?? d.title) : (d.title ?? d.titleDe),
      [de ? 'Typ' : 'Type']: typeLabel(d.type),
      'Version': d.version ?? '—',
      [de ? 'Verantwortlich' : 'Owner']: d.owner ?? d.author ?? '—',
      [de ? 'Genehmigt am' : 'Approved']: d.approved ?? '—',
      [de ? 'Status' : 'Status']: d.status,
    }))), de ? 'QM-Handbuch' : 'QM-Handbook');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(apiParts.map((p) => ({
      [de ? 'Name' : 'Name']: p.name,
      [de ? 'Bootcamp' : 'Bootcamp']: translateText(p.m ?? p.measureName ?? p.measure?.name ?? '', lang) || '—',
      [de ? 'Status' : 'Status']: p.status,
      [de ? 'Förderung' : 'Funding']: p.fund ?? p.fundingType ?? '—',
      [de ? 'Gutscheinnr.' : 'Voucher no.']: p.voucher ?? '—',
      [de ? 'Vollständigkeit' : 'Completeness']: `${p.akte ?? p.fileCompleteness ?? 0}%`,
      [de ? 'Agentur' : 'Agency']: p.ag ?? p.agency ?? '—',
    }))), de ? 'Teilnehmer' : 'Participants');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(apiTrainers.map((t) => ({
      [de ? 'Name' : 'Name']: t.name,
      [de ? 'Fachbereich' : 'Area']: t.qualificationArea ?? t.mde ?? '—',
      [de ? 'Status' : 'Status']: t.qualificationStatus,
      [de ? 'Nachweis / Ablauf' : 'Proof / Expiry']: t.expiry ?? t.ede ?? '—',
    }))), de ? 'Trainer' : 'Trainers');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(apiAlumni.map((a) => ({
      [de ? 'Name' : 'Name']: a.name,
      [de ? 'Bootcamp' : 'Bootcamp']: translateText(a.m ?? a.measureName ?? a.measure?.name ?? '', lang) || '—',
      [de ? 'Abschluss' : 'Graduated']: a.grad ?? a.graduatedAt ?? '—',
      [de ? 'Verbleib' : 'Outcome']: a.outcome,
      [de ? 'Arbeitgeber' : 'Employer']: a.employer ?? '—',
      [de ? '6M Follow-up' : '6M Follow-up']: a.follow6 ? 'Ja' : 'Nein',
      [de ? 'Einwilligung' : 'Consent']: a.consent ? 'Ja' : 'Nein',
    }))), 'Alumni');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(MASSNAHMEN.map((m) => ({
      [de ? 'Name' : 'Name']: m.name,
      'Nr.': m.nr, 'AZAV': m.azav, 'UE': m.ue,
      [de ? 'Format' : 'Format']: m.mode,
      [de ? 'Start' : 'Start']: m.start,
      [de ? 'Ende' : 'End']: m.end,
      [de ? 'Kapazität' : 'Capacity']: m.cap,
      [de ? 'Belegt' : 'Enrolled']: m.enrolled,
      [de ? 'Belegung' : 'Occupancy']: `${Math.round((m.enrolled / m.cap) * 100)}%`,
      [de ? 'Status' : 'Status']: m.status,
    }))), 'Bootcamps');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(PART_DOCS.map((d, i) => ({
      '#': i + 1,
      [de ? 'Dokument' : 'Document']: de ? d.de : d.en,
      [de ? 'Zuständig' : 'Owner']: de ? d.wde : d.wen,
      [de ? 'Info' : 'Info']: de ? d.lde : d.len,
      [de ? 'Status' : 'Status']: d.s,
      [de ? 'Automatisch' : 'Auto']: d.auto ? 'Ja' : '—',
    }))), de ? 'AZAV-Teilnehmer' : 'AZAV-Participants');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(COURSE_DOCS.map((d, i) => ({
      '#': PART_DOCS.length + i + 1,
      [de ? 'Dokument' : 'Document']: de ? d.de : d.en,
      [de ? 'Zuständig' : 'Owner']: de ? d.wde : d.wen,
      [de ? 'Info' : 'Info']: de ? d.lde : d.len,
      [de ? 'Status' : 'Status']: d.s,
    }))), de ? 'AZAV-Bootcamp' : 'AZAV-Bootcamp');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(capaRows.map((c) => ({
      [de ? 'Datum' : 'Date']: c.date ?? '—',
      [de ? 'Quelle' : 'Source']: c.source ?? c.src ?? '—',
      [de ? 'Beschreibung' : 'Description']: de ? (c.description ?? c.desc ?? '—') : (c.descriptionEn ?? c.description ?? '—'),
      [de ? 'Kategorie' : 'Category']: c.category ?? c.cat ?? '—',
      [de ? 'Verantwortlich' : 'Owner']: c.owner ?? '—',
      [de ? 'Fällig am' : 'Due date']: c.dueDate ?? c.due ?? '—',
      [de ? 'Status' : 'Status']: c.status,
    }))), 'CAPA');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      ...PROC_EV.map((e) => ({
        [de ? 'Nachweis' : 'Evidence']: de ? e.de : e.en,
        [de ? 'Detail' : 'Detail']: de ? e.ede : e.een,
        [de ? 'Status' : 'Status']: e.ok ? 'OK ✅' : 'Open ⚠️',
      })),
      { [de ? 'Nachweis' : 'Evidence']: de ? 'Teilnehmerakten' : 'Participant files', [de ? 'Detail' : 'Detail']: `${docsReady}/${apiDocs.length}`, [de ? 'Status' : 'Status']: docsIncomplete === 0 ? 'OK ✅' : 'Open ⚠️' },
      { [de ? 'Nachweis' : 'Evidence']: de ? 'Trainer qualifiziert' : 'Trainers OK', [de ? 'Detail' : 'Detail']: `${trainerOk}/${apiTrainers.length}`, [de ? 'Status' : 'Status']: trainerOk === apiTrainers.length ? 'OK ✅' : 'Open ⚠️' },
      { [de ? 'Nachweis' : 'Evidence']: de ? '6-Monats Follow-up' : '6M Follow-up', [de ? 'Detail' : 'Detail']: `${follow6Done}/${totalAlumni}`, [de ? 'Status' : 'Status']: follow6Done === totalAlumni && totalAlumni > 0 ? 'OK ✅' : 'Open ⚠️' },
    ]), de ? 'Nachweise' : 'Evidence');

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      ...INT_AUDITS.map((a) => ({ [de ? 'Datum' : 'Date']: a.date, [de ? 'Art' : 'Type']: de ? a.tde : a.ten, [de ? 'Befunde' : 'Findings']: a.findings, [de ? 'Offen' : 'Open']: a.open, [de ? 'Status' : 'Status']: a.status, [de ? 'Quelle' : 'Source']: 'Intern' })),
      ...AUDIT_HIST.map((a) => ({ [de ? 'Datum' : 'Date']: a.date, [de ? 'Art' : 'Type']: de ? a.tde : a.ten, [de ? 'Befunde' : 'Findings']: de ? a.fde : a.fen, [de ? 'Offen' : 'Open']: '—', [de ? 'Status' : 'Status']: a.status, [de ? 'Quelle' : 'Source']: a.stelle })),
    ]), 'Audits');

    XLSX.writeFile(wb, `QM-Export_${fileDate()}.xlsx`);
  };

  // ===== INDIVIDUAL EXPORTS =====
  const exportHandbook     = () => exportSheet(qmDocs.map((d) => ({ [de ? 'Titel' : 'Title']: de ? (d.titleDe ?? d.title) : (d.title ?? d.titleDe), [de ? 'Typ' : 'Type']: typeLabel(d.type), 'Version': d.version ?? '—', [de ? 'Verantwortlich' : 'Owner']: d.owner ?? d.author ?? '—', [de ? 'Genehmigt am' : 'Approved']: d.approved ?? '—', [de ? 'Status' : 'Status']: d.status })), de ? 'QM-Handbuch' : 'QM-Handbook', 'QM-Handbook');
  const exportParticipants = () => exportSheet(apiParts.map((p) => ({ [de ? 'Name' : 'Name']: p.name, [de ? 'Bootcamp' : 'Bootcamp']: translateText(p.m ?? p.measureName ?? p.measure?.name ?? '', lang) || '—', [de ? 'Status' : 'Status']: p.status, [de ? 'Förderung' : 'Funding']: p.fund ?? p.fundingType ?? '—', [de ? 'Gutscheinnr.' : 'Voucher']: p.voucher ?? '—', [de ? 'Vollständigkeit' : 'Completeness']: `${p.akte ?? 0}%`, [de ? 'Agentur' : 'Agency']: p.ag ?? '—' })), de ? 'Teilnehmer' : 'Participants', de ? 'Teilnehmer' : 'Participants');
  const exportTrainers     = () => exportSheet(apiTrainers.map((t) => ({ [de ? 'Name' : 'Name']: t.name, [de ? 'Fachbereich' : 'Area']: t.qualificationArea ?? '—', [de ? 'Status' : 'Status']: t.qualificationStatus, [de ? 'Nachweis' : 'Proof']: t.expiry ?? '—' })), de ? 'Trainer' : 'Trainers', de ? 'Trainer' : 'Trainers');
  const exportAlumni       = () => exportSheet(apiAlumni.map((a) => ({ [de ? 'Name' : 'Name']: a.name, [de ? 'Bootcamp' : 'Bootcamp']: a.m ?? '—', [de ? 'Abschluss' : 'Graduated']: a.grad ?? '—', [de ? 'Verbleib' : 'Outcome']: a.outcome, [de ? 'Arbeitgeber' : 'Employer']: a.employer ?? '—', [de ? '6M Follow-up' : '6M Follow-up']: a.follow6 ? 'Ja' : 'Nein', [de ? 'Einwilligung' : 'Consent']: a.consent ? 'Ja' : 'Nein' })), 'Alumni', 'Alumni');
  const exportBootcamps    = () => exportSheet(MASSNAHMEN.map((m) => ({ [de ? 'Name' : 'Name']: m.name, 'Nr.': m.nr, 'AZAV': m.azav, 'UE': m.ue, [de ? 'Format' : 'Format']: m.mode, [de ? 'Start' : 'Start']: m.start, [de ? 'Ende' : 'End']: m.end, [de ? 'Kapazität' : 'Capacity']: m.cap, [de ? 'Belegt' : 'Enrolled']: m.enrolled, [de ? 'Belegung' : 'Occupancy']: `${Math.round((m.enrolled / m.cap) * 100)}%`, [de ? 'Status' : 'Status']: m.status })), 'Bootcamps', 'Bootcamps');
  const exportCapa         = () => exportSheet(capaRows.map((c) => ({ [de ? 'Datum' : 'Date']: c.date ?? '—', [de ? 'Quelle' : 'Source']: c.source ?? c.src ?? '—', [de ? 'Beschreibung' : 'Description']: de ? (c.description ?? c.desc ?? '—') : (c.descriptionEn ?? c.description ?? '—'), [de ? 'Kategorie' : 'Category']: c.category ?? c.cat ?? '—', [de ? 'Verantwortlich' : 'Owner']: c.owner ?? '—', [de ? 'Fällig am' : 'Due date']: c.dueDate ?? c.due ?? '—', [de ? 'Status' : 'Status']: c.status })), 'CAPA', 'CAPA');
  const exportEvidence     = () => exportSheet([
    ...PROC_EV.map((e) => ({ [de ? 'Nachweis' : 'Evidence']: de ? e.de : e.en, [de ? 'Detail' : 'Detail']: de ? e.ede : e.een, [de ? 'Status' : 'Status']: e.ok ? 'OK ✅' : 'Open ⚠️' })),
    { [de ? 'Nachweis' : 'Evidence']: de ? 'Teilnehmerakten' : 'Participant files', [de ? 'Detail' : 'Detail']: `${docsReady}/${apiDocs.length}`, [de ? 'Status' : 'Status']: docsIncomplete === 0 ? 'OK ✅' : 'Open ⚠️' },
    { [de ? 'Nachweis' : 'Evidence']: de ? 'Trainer qualifiziert' : 'Trainers OK', [de ? 'Detail' : 'Detail']: `${trainerOk}/${apiTrainers.length}`, [de ? 'Status' : 'Status']: trainerOk === apiTrainers.length ? 'OK ✅' : 'Open ⚠️' },
    { [de ? 'Nachweis' : 'Evidence']: de ? '6-Monats Follow-up' : '6M Follow-up', [de ? 'Detail' : 'Detail']: `${follow6Done}/${totalAlumni}`, [de ? 'Status' : 'Status']: follow6Done === totalAlumni && totalAlumni > 0 ? 'OK ✅' : 'Open ⚠️' },
  ], de ? 'Nachweise' : 'Evidence', de ? 'Nachweise' : 'Evidence');

  const exportAzavDocs = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(PART_DOCS.map((d, i) => ({ '#': i + 1, [de ? 'Dokument' : 'Document']: de ? d.de : d.en, [de ? 'Zuständig' : 'Owner']: de ? d.wde : d.wen, [de ? 'Info' : 'Info']: de ? d.lde : d.len, [de ? 'Status' : 'Status']: d.s, [de ? 'Auto' : 'Auto']: d.auto ? 'Ja' : '—' }))), de ? 'AZAV-Teilnehmer' : 'AZAV-Participants');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(COURSE_DOCS.map((d, i) => ({ '#': PART_DOCS.length + i + 1, [de ? 'Dokument' : 'Document']: de ? d.de : d.en, [de ? 'Zuständig' : 'Owner']: de ? d.wde : d.wen, [de ? 'Info' : 'Info']: de ? d.lde : d.len, [de ? 'Status' : 'Status']: d.s }))), de ? 'AZAV-Bootcamp' : 'AZAV-Bootcamp');
    XLSX.writeFile(wb, `AZAV-Docs_${fileDate()}.xlsx`);
  };

  const exportAudits = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(INT_AUDITS.map((a) => ({ [de ? 'Datum' : 'Date']: a.date, [de ? 'Art' : 'Type']: de ? a.tde : a.ten, [de ? 'Befunde' : 'Findings']: a.findings, [de ? 'Offen' : 'Open']: a.open, [de ? 'Status' : 'Status']: a.status }))), de ? 'Intern' : 'Internal');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(AUDIT_HIST.map((a) => ({ [de ? 'Datum' : 'Date']: a.date, [de ? 'Stelle' : 'Body']: a.stelle, [de ? 'Art' : 'Type']: de ? a.tde : a.ten, [de ? 'Befunde' : 'Findings']: de ? a.fde : a.fen, [de ? 'Status' : 'Status']: a.status }))), de ? 'Extern (AZAV)' : 'External (AZAV)');
    XLSX.writeFile(wb, `Audits_${fileDate()}.xlsx`);
  };

  // ===== Excel button helper =====
  const ExcelBtn = ({ onClick }: { onClick: () => void }) => (
    <button className="btn btn-ghost"
      style={{ padding: '7px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
      onClick={onClick}>
      <Download size={13} color={C.mint} /> Excel
    </button>
  );

  const TABS = [
    { id: 'kpi',          label: 'KPIs',                              icon: <TrendingUp     size={13} /> },
    { id: 'docs',         label: de ? 'QM-Handbuch' : 'Handbook',    icon: <FileText       size={13} /> },
    { id: 'participants', label: de ? 'Teilnehmer' : 'Participants',  icon: <Users          size={13} /> },
    { id: 'trainers',     label: de ? 'Trainer' : 'Trainers',         icon: <GraduationCap  size={13} /> },
    { id: 'alumni',       label: 'Alumni',                             icon: <Award          size={13} /> },
    { id: 'measures',     label: 'Bootcamps',                          icon: <BookOpen       size={13} /> },
    { id: 'azav_docs',    label: de ? 'AZAV-Dokumente' : 'AZAV docs', icon: <ClipboardCheck size={13} /> },
    { id: 'capa',         label: 'CAPA',                               icon: <AlertTriangle  size={13} /> },
    { id: 'evidence',     label: de ? 'Nachweise' : 'Evidence',        icon: <CheckCircle2   size={13} /> },
    // audit tab moved to sidebar },
  ];

  return (
    <>
      {/* ===== HEADER + EXPORT ALL ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, color: C.muted }}>
          {de
            ? `${apiParts.length} Teilnehmer · ${apiTrainers.length} Trainer · ${apiAlumni.length} Alumni · ${MASSNAHMEN.length} Bootcamps`
            : `${apiParts.length} participants · ${apiTrainers.length} trainers · ${apiAlumni.length} alumni · ${MASSNAHMEN.length} bootcamps`}
        </div>
        <button className="btn btn-primary"
          style={{ padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}
          onClick={exportAllToExcel}>
          <Download size={15} />
          {de ? 'Alles exportieren (.xlsx)' : 'Export all (.xlsx)'}
        </button>
      </div>

      {/* ===== TABS ===== */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={tab === tb.id ? 'btn btn-primary' : 'btn btn-ghost'}
            style={{ padding: '7px 13px', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5 }}>
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {/* ===== KPI TAB ===== */}
      {tab === 'kpi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Export KPIs */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ExcelBtn onClick={() => exportSheet([
              { KPI: de ? 'Integrationsquote' : 'Integration rate', Value: `${integrationRate}%`, Target: '60%' },
              { KPI: de ? 'Abbruchquote' : 'Dropout rate',          Value: `${dropoutRate}%`,     Target: '< 20%' },
              { KPI: de ? 'Bestehensquote' : 'Pass rate',           Value: `${passRate}%`,         Target: '80%' },
              { KPI: de ? 'Offene CAPA' : 'Open CAPA',              Value: `${openCapa}`,          Target: '0' },
              { KPI: de ? 'Dokumente vollständig' : 'Docs complete', Value: `${docsReady}/${apiDocs.length}`, Target: '100%' },
              { KPI: de ? 'Trainer qualifiziert' : 'Trainers OK',   Value: `${trainerOk}/${apiTrainers.length}`, Target: '100%' },
              { KPI: de ? '6-Monats Follow-up' : '6M Follow-up',    Value: `${follow6Done}/${totalAlumni}`, Target: '100%' },
            ], 'KPIs', 'KPIs')} />
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {kpis.map((k, i) => (
              <div key={i} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{de ? k.de : k.en}</div>
                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{de ? k.tde : k.ten}</div>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: k.color }}>{k.val}</div>
                </div>
                <Bar2 pct={k.pct} />
              </div>
            ))}
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              [de ? 'Teilnehmer' : 'Participants', totalParts,         C.iris],
              [de ? 'Trainer'    : 'Trainers',     apiTrainers.length, C.amber],
              ['Alumni',                            totalAlumni,        C.mint],
              ['Bootcamps',                         MASSNAHMEN.length,  C.iris],
            ].map(([label, val, col]: any, i) => (
              <div key={i} className="card" style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: col }}>{val}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              [de ? 'Dokumente vollständig' : 'Docs complete',      `${docsReady}/${apiDocs.length}`,       docsIncomplete === 0 ? C.mint : C.amber],
              [de ? 'Trainer qualifiziert'  : 'Trainers qualified',  `${trainerOk}/${apiTrainers.length}`,   trainerOk === apiTrainers.length ? C.mint : C.amber],
              [de ? '6-Monats-Follow-up'    : '6-month follow-up',   `${follow6Done}/${totalAlumni}`,        follow6Done === totalAlumni && totalAlumni > 0 ? C.mint : C.amber],
            ].map(([label, val, col]: any, i) => (
              <div key={i} className="card" style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: col }}>{val}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== QM DOCS TAB ===== */}
      {tab === 'docs' && (
        <div className="card" style={{ padding: '19px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px 14px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={15} color={C.iris} />
              {de ? 'QM-Handbuch & Prozesse' : 'QM Handbook & Processes'} · {qmDocs.length}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <ExcelBtn onClick={exportHandbook} />
              <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={openCreate}>
                <Plus size={14} /> {de ? 'Neu' : 'New'}
              </button>
            </div>
          </div>
          {qmDocs.length === 0 && <div style={{ padding: '0 13px 20px', color: C.muted, fontSize: 13 }}>{de ? 'Keine Dokumente.' : 'No documents.'}</div>}
          {qmDocs.length > 0 && (
            <div className="scroll-x">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>{de ? 'Titel' : 'Title'}</th>
                    <th className="hide-mobile">{de ? 'Typ' : 'Type'}</th>
                    <th className="hide-mobile">Version</th>
                    <th className="hide-mobile">{de ? 'Verantwortlich' : 'Owner'}</th>
                    <th className="hide-mobile">{de ? 'Genehmigt' : 'Approved'}</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {qmDocs.map((d, i) => {
                    const isValid  = d.status === 'valid' || d.status === 'doc_ready';
                    const isReview = d.status === 'inReview';
                    const color    = isValid ? C.mint : isReview ? C.amber : C.rose;
                    return (
                      <tr key={d.id ?? i} className="row" style={{ cursor: 'pointer' }} onClick={() => setViewDoc(d)}>
                        <td>{isValid ? <CheckCircle2 size={15} color={C.mint} /> : isReview ? <AlertTriangle size={14} color={C.amber} /> : <FileText size={14} color={C.muted} />}</td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>
                          {de ? (d.titleDe ?? d.title) : (d.title ?? d.titleDe)}
                          {d.fileRef && <span style={{ marginLeft: 6, fontSize: 10, color: C.mint }}>📎</span>}
                        </td>
                        <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{typeLabel(d.type)}</td>
                        <td className="hide-mobile" style={{ fontSize: 12 }}>{d.version ?? '—'}</td>
                        <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{d.owner ?? d.author ?? '—'}</td>
                        <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{d.approved ?? '—'}</td>
                        <td><span className="badge" style={{ background: color + '18', color, fontSize: 11 }}>{isValid ? (de ? 'Gültig' : 'Valid') : isReview ? (de ? 'In Prüfung' : 'In review') : (de ? 'Entwurf' : 'Draft')}</span></td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="icon-mini" title="View"     onClick={() => setViewDoc(d)}><Eye size={13} color={C.iris} /></button>
                            <button className="icon-mini" title="Download" onClick={() => downloadQmDoc(d)}><Download size={13} color={C.muted} /></button>
                            <button className="icon-mini" title="Upload"   disabled={uploading === d.id} onClick={() => fileUploadRef.current[d.id]?.click()}>
                              <Upload size={13} color={uploading === d.id ? C.muted : C.amber} />
                            </button>
                            <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                              ref={(el) => { fileUploadRef.current[d.id] = el; }}
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadQmDoc(d.id, f); e.target.value = ''; }} />
                            <button className="icon-mini" onClick={() => openEditDoc(d)}><Pencil size={13} color={C.muted} /></button>
                            <button className="icon-mini" onClick={() => removeDoc(d.id)}><Trash2 size={13} color={C.rose} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== PARTICIPANTS TAB ===== */}
      {tab === 'participants' && (
        <div className="card" style={{ padding: '19px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px 14px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={15} color={C.iris} />
              {de ? 'Teilnehmer' : 'Participants'} · {apiParts.length}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <ExcelBtn onClick={exportParticipants} />
              {[
                [de ? 'Aktiv' : 'Active',        apiParts.filter(p => p.status === 'active').length,    C.mint],
                [de ? 'Abbruch' : 'Dropped',     apiParts.filter(p => p.status === 'dropped').length,   C.rose],
                [de ? 'Abgeschl.' : 'Completed', apiParts.filter(p => p.status === 'completed').length, C.iris],
              ].map(([label, val, col]: any, i) => (
                <span key={i} className="badge" style={{ background: col + '18', color: col }}>{val} {label}</span>
              ))}
            </div>
          </div>
          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>{de ? 'Name' : 'Name'}</th>
                  <th>Bootcamp</th>
                  <th>Status</th>
                  <th className="hide-mobile">{de ? 'Förderung' : 'Funding'}</th>
                  <th className="hide-mobile">{de ? 'Vollständigkeit' : 'Completeness'}</th>
                  <th className="hide-mobile">{de ? 'Gutscheinnr.' : 'Voucher no.'}</th>
                </tr>
              </thead>
              <tbody>
                {apiParts.map((p, i) => {
                  const akte = p.akte ?? p.fileCompleteness ?? 0;
                  const sc   = p.status === 'active' || p.status === 'completed' ? C.mint : p.status === 'dropped' || p.status === 'no_show' ? C.rose : C.amber;
                  return (
                    <tr key={p.id ?? i} className="row">
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar n={p.name} c={p.c} /><span style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</span></div></td>
                      <td style={{ fontSize: 12.5 }}>{translateText(p.m ?? p.measureName ?? p.measure?.name ?? '', lang) || '—'}</td>
                      <td><span className="badge" style={{ background: sc + '18', color: sc, fontSize: 11 }}>{p.status}</span></td>
                      <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{p.fund ?? p.fundingType ?? '—'}</td>
                      <td className="hide-mobile">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.line }}>
                            <div style={{ height: 6, borderRadius: 3, width: `${akte}%`, background: akte >= 80 ? C.mint : C.amber }} />
                          </div>
                          <span style={{ fontSize: 11, color: C.muted, minWidth: 28 }}>{akte}%</span>
                        </div>
                      </td>
                      <td className="hide-mobile" style={{ fontSize: 11.5, color: C.muted }}>{p.voucher ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== TRAINERS TAB ===== */}
      {tab === 'trainers' && (
        <div className="card" style={{ padding: '19px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px 14px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <GraduationCap size={15} color={C.iris} />
              {de ? 'Trainer' : 'Trainers'} · {apiTrainers.length}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <ExcelBtn onClick={exportTrainers} />
              {[
                [de ? 'Vollständig'   : 'Complete',   apiTrainers.filter(t => t.qualificationStatus === 'complete').length,   C.mint],
                [de ? 'Unvollständig' : 'Incomplete', apiTrainers.filter(t => t.qualificationStatus === 'incomplete').length, C.rose],
                [de ? 'Läuft ab'      : 'Expiring',   apiTrainers.filter(t => t.qualificationStatus === 'expiring').length,   C.amber],
              ].map(([label, val, col]: any, i) => (
                <span key={i} className="badge" style={{ background: col + '18', color: col }}>{val} {label}</span>
              ))}
            </div>
          </div>
          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>{de ? 'Name' : 'Name'}</th>
                  <th>{de ? 'Fachbereich' : 'Area'}</th>
                  <th>Status</th>
                  <th className="hide-mobile">{de ? 'Nachweis / Ablauf' : 'Proof / Expiry'}</th>
                </tr>
              </thead>
              <tbody>
                {apiTrainers.map((t, i) => {
                  const color = t.qualificationStatus === 'complete' ? C.mint : t.qualificationStatus === 'expiring' ? C.amber : C.rose;
                  return (
                    <tr key={t.id ?? i} className="row">
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar n={t.name} c={t.c} /><span style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</span></div></td>
                      <td style={{ fontSize: 12.5 }}>{t.qualificationArea ?? t.mde ?? '—'}</td>
                      <td><span className="badge" style={{ background: color + '18', color, fontSize: 11 }}>{t.qualificationStatus}</span></td>
                      <td className="hide-mobile" style={{ fontSize: 12, color: t.qualificationStatus !== 'complete' ? C.rose : C.muted }}>
                        {t.qualificationStatus !== 'complete' && <AlertTriangle size={12} style={{ marginRight: 4 }} />}
                        {t.expiry ?? t.ede ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== ALUMNI TAB ===== */}
      {tab === 'alumni' && (
        <div className="card" style={{ padding: '19px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px 14px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={15} color={C.iris} />
              {de ? 'Alumni & Verbleib' : 'Alumni & Placement'} · {apiAlumni.length}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <ExcelBtn onClick={exportAlumni} />
              <span className="badge" style={{ background: C.mint + '18', color: C.mint }}>
                {de ? 'Integrationsquote' : 'Integration rate'}: {integrationRate}%
              </span>
            </div>
          </div>
          <div className="scroll-x">
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
                </tr>
              </thead>
              <tbody>
                {apiAlumni.map((a, i) => {
                  const oc = a.outcome === 'employed' ? C.mint : a.outcome === 'seeking' ? C.amber : a.outcome === 'unknown' ? C.rose : C.iris;
                  return (
                    <tr key={a.id ?? i} className="row">
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar n={a.name} c={a.c} /><span style={{ fontWeight: 600, fontSize: 13 }}>{a.name}</span></div></td>
                      <td style={{ fontSize: 12.5 }}>{translateText(a.m ?? a.measureName ?? a.measure?.name ?? '', lang) || '—'}</td>
                      <td style={{ fontSize: 12, color: C.muted }}>{a.grad ?? a.graduatedAt ?? '—'}</td>
                      <td><span className="badge" style={{ background: oc + '18', color: oc, fontSize: 11 }}>{a.outcome}</span></td>
                      <td className="hide-mobile" style={{ fontSize: 12.5 }}>{a.employer ?? '—'}</td>
                      <td className="hide-mobile">{a.follow6 ? <CheckCircle2 size={15} color={C.mint} /> : <X size={14} color={C.rose} />}</td>
                      <td className="hide-mobile">{a.consent  ? <CheckCircle2 size={15} color={C.mint} /> : <X size={14} color={C.rose} />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== BOOTCAMPS TAB ===== */}
      {tab === 'measures' && (
        <div className="card" style={{ padding: '19px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px 14px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={15} color={C.iris} />
              Bootcamps · {MASSNAHMEN.length}
            </div>
            <ExcelBtn onClick={exportBootcamps} />
          </div>
          <div className="scroll-x">
            <table>
              <thead>
                <tr>
                  <th>{de ? 'Name' : 'Name'}</th>
                  <th className="hide-mobile">Nr.</th>
                  <th className="hide-mobile">AZAV</th>
                  <th>{de ? 'Start' : 'Start'}</th>
                  <th>{de ? 'Ende' : 'End'}</th>
                  <th>{de ? 'Belegung' : 'Occupancy'}</th>
                  <th>Status</th>
                  <th className="hide-mobile">TL</th>
                </tr>
              </thead>
              <tbody>
                {MASSNAHMEN.map((m, i) => {
                  const sc = m.status === 'running' ? C.mint : m.status === 'finishing' ? C.amber : m.status === 'planned' ? C.iris : C.muted;
                  const tc = (t: string) => t === 'g' ? C.mint : t === 'a' ? C.amber : C.rose;
                  return (
                    <tr key={i} className="row">
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{translateText(m.name, lang)}</td>
                      <td className="hide-mobile" style={{ fontSize: 11.5, color: C.muted }}>{m.nr}</td>
                      <td className="hide-mobile" style={{ fontSize: 11.5, color: C.muted }}>{m.azav}</td>
                      <td style={{ fontSize: 12 }}>{m.start}</td>
                      <td style={{ fontSize: 12 }}>{m.end}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: C.line, minWidth: 50 }}>
                            <div style={{ height: 6, borderRadius: 3, background: C.iris, width: `${Math.round((m.enrolled / m.cap) * 100)}%` }} />
                          </div>
                          <span style={{ fontSize: 11, color: C.muted }}>{m.enrolled}/{m.cap}</span>
                        </div>
                      </td>
                      <td><span className="badge" style={{ background: sc + '18', color: sc, fontSize: 11 }}>{m.status}</span></td>
                      <td className="hide-mobile">
                        <div style={{ display: 'flex', gap: 5 }}>
                          {[m.tl.sig, m.tl.doz, m.tl.cert, m.tl.compl].map((t, j) => (
                            <div key={j} style={{ width: 10, height: 10, borderRadius: '50%', background: tc(t) }} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== AZAV DOCS TAB ===== */}
      {tab === 'azav_docs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ padding: '19px 8px 8px' }}>
            <div className="card-head" style={{ padding: '0 13px 14px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Users size={15} color={C.iris} />
                {de ? 'Dokumente je Teilnehmer' : 'Documents per participant'} · {PART_DOCS.length}
              </div>
              <ExcelBtn onClick={exportAzavDocs} />
            </div>
            <div className="scroll-x">
              <table>
                <thead><tr><th>#</th><th>{de ? 'Dokument' : 'Document'}</th><th className="hide-mobile">{de ? 'Zuständig' : 'Owner'}</th><th className="hide-mobile">Info</th><th>Status</th></tr></thead>
                <tbody>
                  {PART_DOCS.map((d, i) => {
                    const color = d.s === 'doc_ready' ? C.mint : d.s === 'doc_partial' ? C.amber : d.s === 'doc_review' ? C.iris : C.rose;
                    return (
                      <tr key={i} className="row">
                        <td style={{ fontSize: 11, color: C.muted }}>#{i + 1}</td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>{de ? d.de : d.en}</td>
                        <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{de ? d.wde : d.wen}</td>
                        <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{de ? d.lde : d.len}</td>
                        <td><span className="badge" style={{ background: color + '18', color, fontSize: 11 }}>
                          {d.s === 'doc_ready' ? (de ? 'Fertig' : 'Ready') : d.s === 'doc_partial' ? (de ? 'Teilweise' : 'Partial') : d.s === 'doc_review' ? 'Review' : (de ? 'Fehlt' : 'Missing')}
                          {d.auto && ' 🤖'}
                        </span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ padding: '19px 8px 8px' }}>
            <div className="card-head" style={{ padding: '0 13px 14px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={15} color={C.amber} />
                {de ? 'Dokumente je Bootcamp' : 'Documents per Bootcamp'} · {COURSE_DOCS.length}
              </div>
            </div>
            <div className="scroll-x">
              <table>
                <thead><tr><th>#</th><th>{de ? 'Dokument' : 'Document'}</th><th className="hide-mobile">{de ? 'Zuständig' : 'Owner'}</th><th className="hide-mobile">Info</th><th>Status</th></tr></thead>
                <tbody>
                  {COURSE_DOCS.map((d, i) => {
                    const color = d.s === 'doc_ready' ? C.mint : d.s === 'doc_review' ? C.iris : C.amber;
                    return (
                      <tr key={i} className="row">
                        <td style={{ fontSize: 11, color: C.muted }}>#{PART_DOCS.length + i + 1}</td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>{de ? d.de : d.en}</td>
                        <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{de ? d.wde : d.wen}</td>
                        <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{de ? d.lde : d.len}</td>
                        <td><span className="badge" style={{ background: color + '18', color, fontSize: 11 }}>
                          {d.s === 'doc_ready' ? (de ? 'Fertig' : 'Ready') : d.s === 'doc_review' ? 'Review' : (de ? 'Teilweise' : 'Partial')}
                        </span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== CAPA TAB ===== */}
      {tab === 'capa' && (
        <div className="card" style={{ padding: '19px 8px 8px' }}>
          <div className="card-head" style={{ padding: '0 13px 14px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={15} color={C.amber} />
              {de ? 'Beschwerden & CAPA' : 'Complaints & CAPA'} · {capaRows.length}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <ExcelBtn onClick={exportCapa} />
              <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={openCapaCreate}>
                <Plus size={14} /> {de ? 'Neu' : 'New'}
              </button>
            </div>
          </div>
          {capaRows.length === 0 && <div style={{ padding: '0 13px 20px', color: C.muted, fontSize: 13 }}>{de ? 'Keine Fälle.' : 'No cases.'}</div>}
          {capaRows.length > 0 && (
            <div className="scroll-x">
              <table>
                <thead>
                  <tr>
                    <th>{de ? 'Datum' : 'Date'}</th>
                    <th>{de ? 'Quelle' : 'Source'}</th>
                    <th>{de ? 'Beschreibung' : 'Description'}</th>
                    <th className="hide-mobile">{de ? 'Kategorie' : 'Category'}</th>
                    <th className="hide-mobile">{de ? 'Verantwortlich' : 'Owner'}</th>
                    <th className="hide-mobile">{de ? 'Fällig' : 'Due'}</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {capaRows.map((c, i) => (
                    <tr key={c.id ?? i} className="row">
                      <td style={{ fontSize: 12 }}>{c.date ?? '—'}</td>
                      <td style={{ fontSize: 12 }}>{c.source ?? c.src ?? '—'}</td>
                      <td style={{ fontSize: 12.5, fontWeight: 500, maxWidth: 200 }}>{de ? (c.description ?? c.desc ?? '—') : (c.descriptionEn ?? c.description ?? '—')}</td>
                      <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{c.category ?? c.cat ?? '—'}</td>
                      <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{c.owner ?? '—'}</td>
                      <td className="hide-mobile" style={{ fontSize: 12, color: C.muted }}>{c.dueDate ?? c.due ?? '—'}</td>
                      <td><span className="badge" style={{ background: capaColor(c.status) + '18', color: capaColor(c.status), fontSize: 11 }}>{capaLabel(c.status)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="icon-mini" onClick={() => openCapaEdit(c)}><Pencil size={13} color={C.muted} /></button>
                          <button className="icon-mini" onClick={() => removeCapa(c.id)}><Trash2 size={13} color={C.rose} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== EVIDENCE TAB ===== */}
      {tab === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ExcelBtn onClick={exportEvidence} />
          </div>
          {[
            { de: 'Teilnehmerakten vollständig',     en: 'Participant files complete',  ok: docsIncomplete === 0,                              detail: `${docsReady} vollständig · ${docsIncomplete} offen` },
            { de: 'Offene CAPA-Fälle',               en: 'Open CAPA cases',             ok: openCapa === 0,                                    detail: `${openCapa} offen` },
            { de: 'Trainer qualifiziert',             en: 'Trainers qualified',          ok: trainerOk === apiTrainers.length,                  detail: `${trainerOk}/${apiTrainers.length}` },
            { de: 'Alumni-Verbleib erfasst',          en: 'Alumni outcomes tracked',     ok: totalAlumni > 0,                                   detail: `${totalAlumni} Absolventen · ${employed} vermittelt` },
            { de: '6-Monats-Follow-up durchgeführt', en: '6-month follow-up done',      ok: follow6Done === totalAlumni && totalAlumni > 0,    detail: `${follow6Done}/${totalAlumni}` },
          ].map((e, i) => (
            <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: e.ok ? C.mint + '18' : C.rose + '18', display: 'grid', placeItems: 'center' }}>
                {e.ok ? <CheckCircle2 size={18} color={C.mint} /> : <AlertTriangle size={17} color={C.rose} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{de ? e.de : e.en}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{e.detail}</div>
              </div>
              <span className="badge" style={{ background: e.ok ? C.mint + '18' : C.rose + '18', color: e.ok ? C.mint : C.rose, fontSize: 11 }}>
                {e.ok ? 'OK ✅' : (de ? 'Offen ⚠️' : 'Open ⚠️')}
              </span>
            </div>
          ))}

          <div className="card" style={{ padding: '14px 18px' }}>
            <div className="card-title" style={{ marginBottom: 12 }}>{de ? 'Prozessnachweise' : 'Process evidence'}</div>
            {PROC_EV.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < PROC_EV.length - 1 ? `1px solid ${C.lineSoft}` : 'none' }}>
                {e.ok ? <CheckCircle2 size={15} color={C.mint} /> : <AlertTriangle size={14} color={C.rose} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{de ? e.de : e.en}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{de ? e.ede : e.een}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== AUDIT TAB ===== */}

    </>
  );
}

const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15,18,40,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 };
const lbl: React.CSSProperties = { fontSize: 12.5, color: '#334155', display: 'flex', flexDirection: 'column' };
const inp: React.CSSProperties = { width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 9, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' };


