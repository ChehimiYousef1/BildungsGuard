const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');
const lines = c.split('\n');

// Find downloadFile function
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('downloadFile') && lines[i].includes('async')) {
    console.log('Found at line:', i + 1);
    console.log(lines[i]);
    // Replace the function body
    // Find start and end
    let start = i;
    let end = i;
    for (let j = i; j < i + 10; j++) {
      if (lines[j].includes('};')) { end = j; break; }
    }
    console.log('End at line:', end + 1);
    // Replace lines
    lines.splice(start, end - start + 1,
      "  const downloadFile = (id: string) => {",
      "    const doc = allDocs.find((d: any) => d.id === id);",
      "    if (doc?.fileRef) {",
      "      window.open('http://localhost:3000' + doc.fileRef, '_blank');",
      "    } else {",
      "      alert(de ? 'Keine Datei vorhanden.' : 'No file available.');",
      "    }",
      "  };"
    );
    break;
  }
}

fs.writeFileSync('src/features/documents/DocumentModel.tsx', lines.join('\n'), 'utf8');
console.log('DONE');
