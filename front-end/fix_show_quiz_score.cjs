const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');

// Replace the score display to use quiz score when available
c = c.replace(
  "                        {s?.score ? (\n                          <>\n                            <span className=\"mono\" style={{ fontSize: 12.5, fontWeight: 700, color: passed ? C.mint : C.rose }}>\n                              {s.score} · {pct}%\n                            </span>\n                            {passed\n                              ? <CheckCircle2 size={15} color={C.mint} />\n                              : <XCircle     size={15} color={C.rose} />}\n                          </>\n                        ) : (\n                          <span style={{ fontSize: 11.5, color: C.muted }}>\n                            {de ? 'Noch nicht bewertet' : 'Not graded yet'}\n                          </span>\n                        )}",
  "                        {qScore ? (\n                          <>\n                            <span className=\"mono\" style={{ fontSize: 12.5, fontWeight: 700, color: qScore.passed ? C.mint : C.rose }}>\n                              {qScore.score}/{qScore.total} · {Math.round(qScore.score/qScore.total*100)}%\n                            </span>\n                            {qScore.passed\n                              ? <CheckCircle2 size={15} color={C.mint} />\n                              : <XCircle     size={15} color={C.rose} />}\n                          </>\n                        ) : s?.score ? (\n                          <>\n                            <span className=\"mono\" style={{ fontSize: 12.5, fontWeight: 700, color: passed ? C.mint : C.rose }}>\n                              {s.score} · {pct}%\n                            </span>\n                            {passed\n                              ? <CheckCircle2 size={15} color={C.mint} />\n                              : <XCircle     size={15} color={C.rose} />}\n                          </>\n                        ) : (\n                          <span style={{ fontSize: 11.5, color: C.muted }}>\n                            {de ? 'Noch nicht bewertet' : 'Not graded yet'}\n                          </span>\n                        )}"
);

// Remove quiz badge from name since score is now shown in grade column
c = c.replace(
  "                        <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{p.name}{qScore && (<span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: qScore.passed ? '#0FB6A020' : '#F4475F15', color: qScore.passed ? '#0FB6A0' : '#F4475F' }}>Quiz: {qScore.score}/{qScore.total} ({Math.round(qScore.score/qScore.total*100)}%)</span>)}</div>",
  "                        <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{p.name}</div>"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', c, 'utf8');
console.log('DONE');
