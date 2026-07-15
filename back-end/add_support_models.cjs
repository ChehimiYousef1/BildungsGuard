const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

const models = `
model SupportTicket {
  id          String           @id @default(cuid())
  subject     String
  type        String
  status      String           @default("open")
  userId      String
  userRole    String
  userName    String
  tenantId    String
  messages    SupportMessage[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  @@index([tenantId])
  @@index([userId])
}

model SupportMessage {
  id         String         @id @default(cuid())
  ticketId   String
  ticket     SupportTicket  @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  senderId   String
  senderName String
  senderRole String
  content    String
  fileRef    String?
  tenantId   String
  createdAt  DateTime       @default(now())
  @@index([ticketId])
  @@index([tenantId])
}`;

c = c + '\n' + models;
fs.writeFileSync('prisma/schema.prisma', c, 'utf8');
console.log('DONE');
console.log('Has SupportTicket:', c.includes('SupportTicket'));
