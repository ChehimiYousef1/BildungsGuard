const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Add quiz score display in participant row
c = c.replace(
  "                    const s      = getScore(p.id, a);",
  "                    const s      = getScore(p.id, a);\n                    const qScore = quizzes.length > 0 ? (() => { const allAtt = Object.values(quizAttempts).flat(); const pAtt = allAtt.filter((at) => at.participantId === p.id); if (!pAtt.length) return null; const best = pAtt.reduce((b, x) => (x.score > b.score ? x : b), pAtt[0]); return best; })() : null;"
);

// Show quiz score in the participant row after name
c = c.replace(
  "                        <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{p.name}</div>",
  "                        <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{p.name}{qScore && (<span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: qScore.passed ? '#0FB6A020' : '#F4475F15', color: qScore.passed ? '#0FB6A0' : '#F4475F' }}>Quiz: {qScore.score}/{qScore.total} ({Math.round(qScore.score/qScore.total*100)}%)</span>)}</div>"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');
