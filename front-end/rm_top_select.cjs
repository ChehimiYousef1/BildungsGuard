const fs = require('fs');
let c = fs.readFileSync('src/features/alumni/Alumni.tsx', 'utf8');

// Find and remove the select + its closing div in card-head
const start = c.indexOf("          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>\n            <select");
const end = c.indexOf('          </div>\n        </div>', start) + '          </div>\n        </div>'.length;

if (start > -1 && end > start) {
  c = c.slice(0, start) + '          <div style={{ display: \'flex\', gap: 8, alignItems: \'center\' }}>\n            </div>\n        </div>' + c.slice(end);
  console.log('Removed select OK');
} else {
  console.log('Pattern not found');
}

fs.writeFileSync('src/features/alumni/Alumni.tsx', c, 'utf8');
console.log('DONE');
