const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/TrainerFile.tsx', 'utf8');

// Add Upload icon to imports
c = c.replace(
  "import { CheckCircle2, BadgeCheck, Plus, X, Pencil, Trash2, FileCheck2, User, Mail } from 'lucide-react';",
  "import { CheckCircle2, BadgeCheck, Plus, X, Pencil, Trash2, FileCheck2, User, Mail, Upload, FileText } from 'lucide-react';"
);

// Add CV state after existing state
c = c.replace(
  "  const [form, setForm] = useState<any>({ title: '', type: 'qualification', validUntil: '', approvedFor: '' });",
  "  const [form, setForm] = useState<any>({ title: '', type: 'qualification', validUntil: '', approvedFor: '' });\n  const [cvFile,     setCvFile]     = useState<File | null>(null);\n  const [cvUploading, setCvUploading] = useState(false);\n  const [cvUrl,      setCvUrl]      = useState<string | null>(null);\n  const cvRef = React.useRef<HTMLInputElement | null>(null);"
);

// Add React import
c = c.replace(
  "import React, { useState, useEffect } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

// Fix useRef
c = c.replace(
  "  const cvRef = React.useRef<HTMLInputElement | null>(null);",
  "  const cvRef = useRef<HTMLInputElement | null>(null);"
);

// Add CV upload function before return
const lastReturn = c.lastIndexOf('\n  return (');
const cvUploadFn = `
  const uploadCv = async (file: File) => {
    setCvUploading(true);
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(\`\${API}/trainers/cv\`, {
        method: 'POST',
        headers: token ? { Authorization: \`Bearer \${token}\` } : undefined,
        body: fd,
      });
      if (res.ok) { setCvUrl(file.name); alert(de ? 'CV erfolgreich hochgeladen!' : 'CV uploaded successfully!'); }
      else { alert(de ? 'Upload fehlgeschlagen.' : 'Upload failed.'); }
    } catch (e) { console.error('cv upload failed', e); }
    finally { setCvUploading(false); }
  };
`;

c = c.slice(0, lastReturn) + cvUploadFn + '\n  return (' + c.slice(lastReturn + '\n  return ('.length);

// Add CV card before closing fragment
c = c.replace(
  '    </>\n  );\n}',
  `    {/* ===== CV UPLOAD CARD ===== */}
      <div className="card" style={{ marginTop: 15 }}>
        <div className="card-head">
          <div className="card-title">
            <FileText size={15} style={{ marginRight: 6 }} />
            {de ? 'Lebenslauf (CV)' : 'Curriculum Vitae (CV)'}
          </div>
        </div>
        <div style={{ padding: '12px 0' }}>
          <input ref={cvRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCvFile(f); uploadCv(f); } }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px' }}
              disabled={cvUploading}
              onClick={() => cvRef.current?.click()}
            >
              <Upload size={15} />
              {cvUploading ? (de ? 'Wird hochgeladen...' : 'Uploading...') : (de ? 'CV hochladen' : 'Upload CV')}
            </button>
            {(cvFile || cvUrl) && (
              <span style={{ fontSize: 12, color: '#0FB6A0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={13} />
                {cvFile?.name || cvUrl}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 8 }}>
            {de ? 'Erlaubte Formate: PDF, DOC, DOCX' : 'Accepted formats: PDF, DOC, DOCX'}
          </div>
        </div>
      </div>
    </>
  );
}`
);

fs.writeFileSync('src/features/portals/trainer/TrainerFile.tsx', c, 'utf8');
console.log('DONE');
