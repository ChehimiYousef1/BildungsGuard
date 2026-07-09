const fs = require('fs');
let c = fs.readFileSync('src/features/dashboard/Dashboard.tsx', 'utf8');

// Fix click - navigate directly without modal
c = c.replace(
  "onClick={() => { if ((item as any).action === 'incomplete') { setModalParts(participants.filter((p: any) => (p.fileCompleteness ?? 0) < 100)); setModalOpen(true); } else if (item.view) { setView(item.view); } }}",
  "onClick={() => { if (item.view) setView(item.view); }}"
);

// Fix participants view to just go to participants page
c = c.replace(
  "view: 'participants', action: 'incomplete' });",
  "view: 'participants' });"
);

fs.writeFileSync('src/features/dashboard/Dashboard.tsx', c, 'utf8');
console.log('DONE');
