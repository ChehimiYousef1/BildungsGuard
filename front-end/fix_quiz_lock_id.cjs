const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/Learn.tsx', 'utf8');

// Fix lock check: compare against both me.id AND JWT userId
c = c.replace(
  "                console.log('[Quiz Lock] quiz:', quiz.id, '| me.id:', me.id, '| attempts:', arr.map((a:any)=>a.participantId));\n                if (arr.some((a: any) => a.participantId === me.id)) {",
  `                // Get JWT userId as fallback
                let jwtUserId = '';
                try {
                  const tok = localStorage.getItem('aio_token');
                  if (tok) jwtUserId = JSON.parse(atob(tok.split('.')[1])).userId ?? '';
                } catch {}
                const hasAttempt = arr.some((a: any) =>
                  a.participantId === me.id || a.participantId === jwtUserId
                );
                console.log('[Quiz Lock] quiz:', quiz.id, '| me.id:', me.id, '| jwtUserId:', jwtUserId, '| hasAttempt:', hasAttempt);
                if (hasAttempt) {`
);

fs.writeFileSync('src/features/portals/participant/Learn.tsx', c, 'utf8');
console.log('DONE');
