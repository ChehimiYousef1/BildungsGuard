const fs = require('fs');
let s = fs.readFileSync('src/support/support.service.ts', 'utf8');

s = s.replace(
  "        senderId:   user.id,\n        senderName: user.name ?? user.username ?? user.email ?? ",
  "        senderId:   user.userId ?? user.id ?? user.sub,\n        senderName: user.name ?? user.username ?? user.email ?? "
);

fs.writeFileSync('src/support/support.service.ts', s, 'utf8');
console.log('DONE');
