const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Replace exportExcel in modal header with correct data
c = c.replace(
  '<button onClick={exportExcel} className="btn btn-ghost" style={{ padding: \'6px 12px\', fontSize: 12, display: \'flex\', alignItems: \'center\', gap: 5 }}><Download size={13} />{de ? \'Exportieren\' : \'Export\'}</button>',
  `<button onClick={() => {
                const catDocs = allDocs.filter(d => d.type === filterType);
                const rows = catDocs.map(d => ({
                  [de ? 'Teilnehmer' : 'Participant']: participants.find(p => p.id === d.participantId)?.name ?? '-',
                  [de ? 'Typ' : 'Type']: typeLabel(d.type),
                  [de ? 'Status' : 'Status']: d.status ?? '',
                  [de ? 'Datei' : 'File']: d.fileRef ?? '',
                }));
                const ws = XLSX.utils.json_to_sheet(rows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, typeLabel(filterType));
                XLSX.writeFile(wb, typeLabel(filterType) + '.xlsx');
              }} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Download size={13} />{de ? 'Exportieren' : 'Export'}
              </button>`
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');
