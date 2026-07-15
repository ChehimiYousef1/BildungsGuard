import React, { useState, useRef } from 'react';
import { X, Plus, Trash2, Download, Upload, Check, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { C } from '../../../theme/tokens';
import { useApp } from '../../../context/AppContext';
import { api, getToken } from '../../../lib/api';

interface QuizModalProps {
  onClose: () => void;
  onCreated: (quiz: any) => void;
  measureId?: string;
}

const EMPTY_Q = () => ({
  question: '', optionA: '', optionB: '', optionC: '', optionD: '',
  correctAnswer: 'A', points: 1, topic: '',
});

export default function QuizModal({ onClose, onCreated, measureId }: QuizModalProps) {
  const { lang } = useApp();
  const de = lang === 'de';
  const [mode, setMode]         = useState<'manual' | 'import'>('manual');
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [questions, setQuestions] = useState([EMPTY_Q()]);
  const [saving, setSaving]     = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [preview, setPreview]   = useState<any[]>([]);
  const [quizId, setQuizId]     = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const inp: React.CSSProperties = {
    width: '100%', padding: '8px 11px', borderRadius: 8,
    border: '1px solid #E2E8F0', fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#64748B',
    display: 'flex', flexDirection: 'column', gap: 4,
  };

  const addQ  = () => setQuestions(qs => [...qs, EMPTY_Q()]);
  const delQ  = (i: number) => setQuestions(qs => qs.filter((_, j) => j !== i));
  const setQ  = (i: number, k: string, v: any) =>
    setQuestions(qs => qs.map((q, j) => j === i ? { ...q, [k]: v } : q));

  const handleManualSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const valid = questions.filter(q => q.question && q.optionA && q.optionB);
      const quiz = await api('/quiz', {
        method: 'POST',
        body: JSON.stringify({
          title, description: desc || undefined,
          timeLimit: timeLimit ? Number(timeLimit) : undefined,
          measureId: measureId || undefined,
          questions: valid,
        }),
      });
      onCreated(quiz);
    } finally { setSaving(false); }
  };

  const downloadTemplate = async () => {
    const res = await fetch('/api/v1/quiz/template', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'quiz_template.xlsx'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setImportFile(f);
    const reader = new FileReader();
    reader.onload = evt => {
      const wb = XLSX.read(evt.target?.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws) as any[];
      setPreview(rows.slice(0, 5));
    };
    reader.readAsArrayBuffer(f);
  };

  const handleImport = async () => {
    if (!importFile || !title.trim()) return;
    setImporting(true);
    try {
      // First create the quiz
      const quiz = await api('/quiz', {
        method: 'POST',
        body: JSON.stringify({ title, description: desc || undefined, measureId: measureId || undefined }),
      });
      setQuizId((quiz as any).id);
      // Then upload questions
      const form = new FormData();
      form.append('file', importFile);
      await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/quiz/${(quiz as any).id}/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      });
      // Reload quiz with questions
      const full = await api(`/quiz/${(quiz as any).id}`);
      onCreated(full);
    } finally { setImporting(false); }
  };

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,40,.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
      <div onClick={e => e.stopPropagation()} className="card"
        style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex',
          flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {de ? 'Neues Quiz / Aufgabe' : 'New Quiz / Assignment'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}>
            <X size={18} />
          </button>
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0' }}>
          {(['manual', 'import'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: 600, background: 'none',
                borderBottom: mode === m ? `2px solid ${C.iris}` : '2px solid transparent',
                color: mode === m ? C.iris : C.muted }}>
              {m === 'manual'
                ? (de ? 'Manuell erstellen' : 'Create Manually')
                : (de ? 'Aus Excel importieren' : 'Import from Excel')}
            </button>
          ))}
        </div>

        <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {/* Common: title + desc */}
          <label style={lbl}>{de ? 'Quiz-Titel *' : 'Quiz Title *'}
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder={de ? 'z.B. Modul 3 â€“ Abschlusstest' : 'e.g. Module 3 Final Test'}
              style={inp} autoFocus />
          </label>
          <label style={lbl}>{de ? 'Beschreibung' : 'Description (optional)'}
            <input value={desc} onChange={e => setDesc(e.target.value)} style={inp} />
          </label>
          <label style={lbl}>{de ? 'Zeitlimit (Minuten)' : 'Time Limit (minutes, optional)'}
            <input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)}
              placeholder={de ? 'Kein Limit' : 'No limit'} style={{ ...inp, width: 160 }} />
          </label>

          {mode === 'manual' ? (
            <>
              <div style={{ fontWeight: 600, fontSize: 13, color: C.iris, marginTop: 4 }}>
                {de ? 'Fragen' : 'Questions'} ({questions.length})
              </div>
              {questions.map((q, i) => (
                <div key={i} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 14,
                  display: 'flex', flexDirection: 'column', gap: 10, background: '#FAFBFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: C.iris }}>
                      {de ? `Frage ${i + 1}` : `Question ${i + 1}`}
                    </div>
                    {questions.length > 1 && (
                      <button onClick={() => delQ(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.rose }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <label style={lbl}>{de ? 'Frage *' : 'Question *'}
                    <input value={q.question} onChange={e => setQ(i, 'question', e.target.value)} style={inp} />
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(['A','B','C','D'] as const).map(opt => (
                      <label key={opt} style={lbl}>
                        {de ? `Option ${opt}${opt < 'C' ? ' *' : ''}` : `Option ${opt}${opt < 'C' ? ' *' : ''}`}
                        <input value={(q as any)[`option${opt}`]}
                          onChange={e => setQ(i, `option${opt}`, e.target.value)} style={inp}
                          placeholder={opt >= 'C' ? (de ? 'Optional' : 'Optional') : ''} />
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <label style={{ ...lbl, flex: 1 }}>{de ? 'Richtige Antwort' : 'Correct Answer'}
                      <select value={q.correctAnswer} onChange={e => setQ(i, 'correctAnswer', e.target.value)}
                        style={inp}>
                        {['A','B','C','D'].map(o => <option key={o} value={o}>Option {o}</option>)}
                      </select>
                    </label>
                    <label style={{ ...lbl, width: 80 }}>{de ? 'Punkte' : 'Points'}
                      <input type="number" min={1} value={q.points}
                        onChange={e => setQ(i, 'points', Number(e.target.value))} style={inp} />
                    </label>
                    <label style={{ ...lbl, flex: 1 }}>{de ? 'Thema' : 'Topic'}
                      <input value={q.topic} onChange={e => setQ(i, 'topic', e.target.value)}
                        placeholder={de ? 'Optional' : 'Optional'} style={inp} />
                    </label>
                  </div>
                </div>
              ))}
              <button onClick={addQ} className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
                <Plus size={14} /> {de ? 'Frage hinzufÃ¼gen' : 'Add Question'}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button onClick={downloadTemplate} className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
                  border: `1px solid ${C.iris}`, color: C.iris }}>
                <Download size={14} />
                {de ? 'Excel-Vorlage herunterladen' : 'Download Excel Template'}
              </button>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                {de
                  ? 'Laden Sie die Vorlage herunter, fÃ¼llen Sie die Fragen aus und laden Sie die Datei hier hoch.'
                  : 'Download the template, fill in your questions, then upload the file below.'}
                <br/>
                {de ? 'Spalten: Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Points, Topic'
                    : 'Columns: Question, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Points, Topic'}
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                onChange={handleFileSelect} />
              <button onClick={() => fileRef.current?.click()} className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start' }}>
                <Upload size={14} />
                {importFile ? importFile.name : (de ? 'Excel-Datei auswÃ¤hlen' : 'Choose Excel file')}
              </button>
              {preview.length > 0 && (
                <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 6 }}>
                    {de ? 'Vorschau' : 'Preview'} ({preview.length} {de ? 'Fragen' : 'questions'})
                  </div>
                  {preview.map((r, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#334155', padding: '4px 0',
                      borderBottom: i < preview.length-1 ? '1px solid #E2E8F0' : 'none' }}>
                      <strong>{i + 1}.</strong> {r.Question || r.question}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0',
          display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>{de ? 'Abbrechen' : 'Cancel'}</button>
          <button className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            disabled={!title.trim() || saving || importing}
            onClick={mode === 'manual' ? handleManualSave : handleImport}>
            <Check size={14} />
            {(saving || importing) ? 'â€¦' : (de ? 'Quiz erstellen' : 'Create Quiz')}
          </button>
        </div>
      </div>
    </div>
  );
}
