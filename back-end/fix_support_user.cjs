const fs = require('fs');
let s = fs.readFileSync('src/support/support.service.ts', 'utf8');

// Fix user.id to user.userId or user.sub
s = s.replace(
  "where.userId = user.id;",
  "where.userId = user.userId ?? user.id ?? user.sub;"
);

s = s.replace(
  "userId:   user.id,",
  "userId:   user.userId ?? user.id ?? user.sub,"
);

s = s.replace(
  "userName: user.name ?? user.email ?? 'User',",
  "userName: user.name ?? user.username ?? user.email ?? 'User',"
);

s = s.replace(
  "senderId:   user.id,",
  "senderId:   user.userId ?? user.id ?? user.sub,"
);

s = s.replace(
  "senderName: user.name ?? user.email ?? 'User',",
  "senderName: user.name ?? user.username ?? user.email ?? 'User',"
);

s = s.replace(
  "senderId:   user.id,\n        senderName: user.name ?? user.email ?? 'User',",
  "senderId:   user.userId ?? user.id ?? user.sub,\n        senderName: user.name ?? user.username ?? user.email ?? 'User',"
);

fs.writeFileSync('src/support/support.service.ts', s, 'utf8');
console.log('DONE');
