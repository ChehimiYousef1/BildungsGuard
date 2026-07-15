const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Fix empty state message for QM_DOC type
c = c.replace(
  "{allDocs.filter(d => d.type === filterType && (!catSearch || (participants.find(p => p.id === d.participantId)?.name ?? '').toLowerCase().includes(catSearch.toLowerCase()) || typeLabel(d.type).toLowerCase().includes(catSearch.toLowerCase()))).length === 0 && (",
  "{filterType === 'QM_DOC' ? (\n                <div style={{ padding: 20, color: C.muted, fontSize: 13, textAlign: 'center' }}>{de ? 'QM-Dokumente werden im QM-Handbuch verwaltet.' : 'QM documents are managed in the QM Handbook section.'}<br/><button className='btn btn-ghost' style={{marginTop: 10}} onClick={() => { setCatModal(false); }}>Go to QM</button></div>\n              ) : allDocs.filter(d => d.type === filterType && (!catSearch || (participants.find(p => p.id === d.participantId)?.name ?? '').toLowerCase().includes(catSearch.toLowerCase()) || typeLabel(d.type).toLowerCase().includes(catSearch.toLowerCase()))).length === 0 && ("
);

// Close the conditional
c = c.replace(
  "              )}\n            </div>\n          </div>\n        </div>\n      )}\n",
  "              )}\n              {filterType !== 'QM_DOC' && null}\n            </div>\n          </div>\n        </div>\n      )}\n"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');
