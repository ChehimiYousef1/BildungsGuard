const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');
const exportFn = "\n  const exportExcel = () => {\n    const rows = allDocs || [];\n    const data = rows.map((d) => ({\n      'Type': d.type || '',\n      'Participant': (participants || []).find((p) => p.id === d.participantId)?.name || '',\n      'Bootcamp': (measures || []).find((m) => m.id === d.measureId)?.name || '',\n      'Status': d.status || '',\n      'Responsible': d.responsible || '',\n      'File': d.fileRef ? 'Yes' : 'No',\n    }));\n    const ws = XLSX.utils.json_to_sheet(data);\n    const wb = XLSX.utils.book_new();\n    XLSX.utils.book_append_sheet(wb, ws, 'Documents');\n    ws['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 22 }, { wch: 14 }, { wch: 20 }, { wch: 8 }];\n    XLSX.writeFile(wb, 'documents_' + new Date().toISOString().slice(0,10) + '.xlsx');\n  };\n";
const lastIdx = c.lastIndexOf('  return (');
if (lastIdx > -1) {
  c = c.slice(0, lastIdx) + exportFn + '\n  return (' + c.slice(lastIdx + '  return ('.length);
  console.log('exportExcel added OK');
} else { console.log('ERROR: return not found'); }
fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE. Lines: ' + c.split('\n').length);
