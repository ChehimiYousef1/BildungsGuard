const fs = require('fs');
let c = fs.readFileSync('src/features/portals/trainer/Assignment.tsx', 'utf8');
const lines = c.split('\n');

// Find last line before closing return
const lastClose = (() => {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim() === ');' || lines[i].trim() === '  );') return i;
  }
  return -1;
})();

console.log('Last close at line:', lastClose + 1, '->', lines[lastClose]);

// Insert QuizModal before the closing );
lines.splice(lastClose, 0,
  "      {showQuizModal && (",
  "        <QuizModal",
  "          onClose={() => setShowQuizModal(false)}",
  "          onCreated={(q: any) => { setQuizzes((qs: any[]) => [q, ...qs]); setShowQuizModal(false); }}",
  "        />",
  "      )}"
);

fs.writeFileSync('src/features/portals/trainer/Assignment.tsx', lines.join('\n'), 'utf8');
console.log('DONE');
console.log('QuizModal render:', c.includes('<QuizModal') || lines.join('\n').includes('<QuizModal'));
