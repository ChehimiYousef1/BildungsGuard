const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Documents.tsx', 'utf8');

// Fix responsible display - replace raw JSON with formatted text
c = c.replace(
  /\{d\.responsible && <span>\{de \? 'Zust.*?<\/span>\}/gs,
  "{d.responsible && formatResponsible(d.responsible, d.type ?? '', de) ? <span>Info: {formatResponsible(d.responsible, d.type ?? '', de)}</span> : null}"
);

c = c.replace(
  /\{de \? 'Zust.*?'\} \{d\.responsible\}/g,
  "Info: {formatResponsible(d.responsible, d.type ?? '', de)}"
);

c = c.replace(
  /\{de \? 'By:' : 'By:'\} \{d\.responsible\}/g,
  "Info: {formatResponsible(d.responsible, d.type ?? '', de)}"
);

// Fix CAT_ type label
c = c.replace(
  /\{d\.title \|\| typeLabel\(d\.type \?\? ''\) \|\|[^}]+\}/g,
  "{d.type && d.type.startsWith('CAT_') ? (d.title || (de ? 'Kategorie' : 'Category')) : (d.title || typeLabel(d.type ?? '') || (de ? 'Dokument' : 'Document'))}"
);

// Fix type badge - hide CAT_ prefix
c = c.replace(
  /\{d\.type && <span style=\{.*?typeLabel\(d\.type\).*?<\/span>\}/gs,
  "{d.type && !d.type.startsWith('CAT_') && <span style={{ color: col, fontWeight: 600 }}>{typeLabel(d.type)}</span>}"
);

fs.writeFileSync('src/features/portals/participant/Documents.tsx', c, 'utf8');
console.log('DONE - size:', c.length);
