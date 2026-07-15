const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');
const lines = c.split('\n');

// Find the s?.score line in JSX
let scoreLineIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('s?.score') && lines[i].includes('(') && !lines[i].includes('const')) {
    scoreLineIdx = i;
    console.log('Found at line:', i + 1, '->', lines[i].trim());
    break;
  }
}

if (scoreLineIdx > -1) {
  // Find the end of this ternary (closing ) : )
  let end = scoreLineIdx;
  for (let i = scoreLineIdx + 1; i < scoreLineIdx + 20; i++) {
    if (lines[i].includes('Not graded yet') || lines[i].includes('Noch nicht bewertet')) {
      // Find closing ) after this
      for (let j = i; j < i + 5; j++) {
        if (lines[j].trim() === ')}') { end = j; break; }
      }
      break;
    }
  }
  console.log('Block ends at line:', end + 1);

  // Replace block with quiz-aware version
  const newBlock = [
    "                        {qScore ? (",
    "                          <>",
    "                            <span className=\"mono\" style={{ fontSize: 12.5, fontWeight: 700, color: qScore.passed ? C.mint : C.rose }}>",
    "                              {qScore.score}/{qScore.total} \xB7 {Math.round(qScore.score/qScore.total*100)}%",
    "                            </span>",
    "                            {qScore.passed ? <CheckCircle2 size={15} color={C.mint} /> : <XCircle size={15} color={C.rose} />}",
    "                          </>",
    "                        ) : s?.score ? (",
    "                          <>",
    "                            <span className=\"mono\" style={{ fontSize: 12.5, fontWeight: 700, color: passed ? C.mint : C.rose }}>",
    "                              {s.score} \xB7 {pct}%",
    "                            </span>",
    "                            {passed ? <CheckCircle2 size={15} color={C.mint} /> : <XCircle size={15} color={C.rose} />}",
    "                          </>",
    "                        ) : (",
    "                          <span style={{ fontSize: 11.5, color: C.muted }}>",
    "                            {de ? 'Noch nicht bewertet' : 'Not graded yet'}",
    "                          </span>",
    "                        )}"
  ];

  lines.splice(scoreLineIdx, end - scoreLineIdx + 1, ...newBlock);
  console.log('Replaced', end - scoreLineIdx + 1, 'lines with', newBlock.length, 'lines');
}

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', lines.join('\n'), 'utf8');
console.log('DONE');
