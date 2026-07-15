const fs = require('fs');
let c = fs.readFileSync('src/features/documents/DocumentModel.tsx', 'utf8');

// Add useEffect to check localStorage filter on mount
c = c.replace(
  "  const [filterType, setFilterType] = useState('');",
  "  const [filterType, setFilterType] = useState(() => { const f = localStorage.getItem('docs_init_filter'); if (f) { localStorage.removeItem('docs_init_filter'); return f; } return ''; });"
);

fs.writeFileSync('src/features/documents/DocumentModel.tsx', c, 'utf8');
console.log('DONE');
