const fs = require('fs');
let c = fs.readFileSync('src/features/qm/QM.tsx', 'utf8');

// Add submitDoc function before return
const returnIdx = c.lastIndexOf('\n  return (');
const submitFn = `
  const submitDoc = async () => {
    try {
      if (editId) {
        await api('/qm-docs/' + editId, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await api('/qm-docs', { method: 'POST', body: JSON.stringify(form) });
      }
      setOpen(false);
      setEditId(null);
      const fresh = await api('/qm-docs').catch(() => []);
      setQmDocs(Array.isArray(fresh) ? fresh : []);
    } catch (e) { console.error('submitDoc failed', e); }
  };
`;

c = c.slice(0, returnIdx) + submitFn + c.slice(returnIdx);
fs.writeFileSync('src/features/qm/QM.tsx', c, 'utf8');
console.log('DONE - has submitDoc:', c.includes('submitDoc'));
