const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

// Fix: check attempts using me.id (participant ID not user ID)
c = c.replace(
  "                if (arr.some((a: any) => a.participantId === me.id)) {",
  "                // me.id is the participant ID - check against attempts\n                console.log('[Quiz Lock] quiz:', quiz.id, '| me.id:', me.id, '| attempts:', arr.map((a:any)=>a.participantId));\n                if (arr.some((a: any) => a.participantId === me.id)) {"
);

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE');
