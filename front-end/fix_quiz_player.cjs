const fs = require('fs');
let c = fs.readFileSync('src/features/portals/participant/QuizPlayer.tsx', 'utf8');

// Fix onComplete to not close immediately - let user close manually
c = c.replace(
  "      setResult(res);\n      setSubmitted(true);\n      onComplete?.(res);",
  "      setResult(res);\n      setSubmitted(true);\n      onComplete?.(res);\n      // Don't auto-close — user closes manually after seeing results"
);

// Fix the Close button in results to properly reset
c = c.replace(
  "      <button className=\"btn btn-ghost\" onClick={onClose}>",
  "      <button className=\"btn btn-primary\" onClick={onClose}>"
);

fs.writeFileSync('src/features/portals/participant/QuizPlayer.tsx', c, 'utf8');
console.log('DONE');
