const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Fix symbols in accordion participant rows
c = c.replace(
  "{pDocs.length > 0 && <> &nbsp;?&nbsp; <span style={{ color: '#0FB6A0' }}>? {ok}</span> &nbsp;?&nbsp; <span style={{ color: '#F4475F' }}>? {miss}</span></>}",
  "{pDocs.length > 0 && <> &nbsp;&middot;&nbsp; <span style={{ color: '#0FB6A0' }}>{ok} ok</span> &nbsp;&middot;&nbsp; <span style={{ color: '#F4475F' }}>{miss} miss</span></>}"
);

// Fix rotate symbol
c = c.replace(
  "transform: isOpen ? 'rotate(90deg)' : 'none' }}>?</span>",
  "transform: isOpen ? 'rotate(90deg)' : 'none' }}>&#9654;</span>"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');
