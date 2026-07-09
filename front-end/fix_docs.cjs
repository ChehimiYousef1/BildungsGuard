const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Documents.tsx', 'utf8');

const fn = '\nfunction formatResponsible(responsible, type, de) {\n  if (!responsible) return "";\n  try {\n    const obj = JSON.parse(responsible);\n    if (typeof obj !== "object" || obj === null) return responsible;\n    if (type === "CV") {\n      const p = [];\n      if (obj.education)  p.push((de ? "Bildung" : "Education") + ": " + obj.education);\n      if (obj.experience) p.push((de ? "Erfahrung" : "Experience") + ": " + obj.experience + (de ? " Jahre" : " years"));\n      if (obj.languages)  p.push((de ? "Sprachen" : "Languages") + ": " + obj.languages);\n      if (obj.skills)     p.push((de ? "Kenntnisse" : "Skills") + ": " + obj.skills);\n      if (obj.lastUpdated) p.push((de ? "Aktualisiert" : "Updated") + ": " + obj.lastUpdated);\n      return p.join(" · ") || "";\n    }\n    if (type === "PRIVACY_CONSENT" || type === "MEDIA_CONSENT") {\n      const p = [];\n      if (obj.name)       p.push(obj.name);\n      if (obj.signedDate) p.push((de ? "Unterschrieben" : "Signed") + ": " + obj.signedDate);\n      if (obj.mediaTypes) p.push(Array.isArray(obj.mediaTypes) ? obj.mediaTypes.join(", ") : obj.mediaTypes);\n      if (obj.purpose)    p.push(obj.purpose);\n      return p.join(" · ") || "";\n    }\n    if (type === "SICK_NOTE") {\n      const p = [];\n      if (obj.dateFrom)    p.push((de ? "Von" : "From") + ": " + obj.dateFrom);\n      if (obj.dateTo)      p.push((de ? "Bis" : "To") + ": " + obj.dateTo);\n      if (obj.doctor)      p.push((de ? "Arzt" : "Doctor") + ": " + obj.doctor);\n      if (obj.institution) p.push(obj.institution);\n      return p.join(" · ") || "";\n    }\n    if (type === "CERTIFICATE") {\n      const p = [];\n      if (obj.title)      p.push(obj.title);\n      if (obj.certType)   p.push(obj.certType);\n      if (obj.issuedDate) p.push((de ? "Ausgestellt" : "Issued") + ": " + obj.issuedDate);\n      if (obj.issuedBy)   p.push(obj.issuedBy);\n      return p.join(" · ") || "";\n    }\n    return "";\n  } catch { return responsible || ""; }\n}\n';

const idx = c.indexOf('};', c.indexOf('TYPE_META'));
c = c.slice(0, idx + 2) + fn + c.slice(idx + 2);

// Fix CAT_ display
c = c.replace(/\{d\.title \|\| typeLabel\(d\.type \?\? ''\) \|\| \(de \? 'Dokument' : 'Document'\)\}/g,
  "{d.type && d.type.startsWith('CAT_') ? (d.title || (de ? 'Kategorie' : 'Category')) : (d.title || typeLabel(d.type ?? '') || (de ? 'Dokument' : 'Document'))}");

// Fix responsible display - replace JSON with formatted text
c = c.replace(/\{d\.responsible && <span>\{de \? 'Zuständig:' : 'By:'\} \{d\.responsible\}<\/span>\}/g,
  "{d.responsible && formatResponsible(d.responsible, d.type ?? '', de) && <span>{formatResponsible(d.responsible, d.type ?? '', de)}</span>}");

// Also fix simpler pattern
c = c.replace(/\{de \? 'Zuständig:' : 'By:'\} \{d\.responsible\}/g,
  "{de ? 'Info:' : 'Info:'} {formatResponsible(d.responsible, d.type ?? '', de)}");

fs.writeFileSync('src/features/portals/participant/Documents.tsx', c, 'utf8');
console.log('DONE');
