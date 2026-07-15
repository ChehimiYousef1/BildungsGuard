const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Replace emoji with text labels
c = c.replace(
  "style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6D5DF6', fontSize: 12, padding: '2px 6px' }}>??</button>",
  "style={{ background: 'none', border: '1px solid #6D5DF630', borderRadius: 6, cursor: 'pointer', color: '#6D5DF6', fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>{de ? 'Ansehen' : 'View'}</button>"
);

c = c.replace(
  "style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F59E0B', fontSize: 12, padding: '2px 6px' }}>??</button>",
  "style={{ background: 'none', border: '1px solid #F59E0B30', borderRadius: 6, cursor: 'pointer', color: '#F59E0B', fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>{de ? 'Bearbeiten' : 'Edit'}</button>"
);

c = c.replace(
  "style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F4475F', fontSize: 12, padding: '2px 6px' }}>??</button>",
  "style={{ background: 'none', border: '1px solid #F4475F30', borderRadius: 6, cursor: 'pointer', color: '#F4475F', fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>{de ? 'Löschen' : 'Delete'}</button>"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');
