const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

c = c.replace(
  "downloadFile = async (id: string) => {\n    try {\n      const data = await api<{ url: string }>(`/documents/${id}/file-url`);\n      if (data?.url) window.open(data.url, '_blank');\n      else alert(de ? 'Keine Datei vorhanden.' : 'No file available.');\n    } catch (e) { console.error(e); }\n  };",
  "downloadFile = (id: string) => {\n    const doc = allDocs.find((d) => d.id === id);\n    if (doc?.fileRef) {\n      window.open('http://localhost:3000' + doc.fileRef, '_blank');\n    } else {\n      alert(de ? 'Keine Datei vorhanden.' : 'No file available.');\n    }\n  };"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');
