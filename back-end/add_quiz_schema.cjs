const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

const models = `
model Quiz {
  id          String        @id @default(cuid())
  title       String
  description String?
  measureId   String?
  passMark    Int           @default(50)
  timeLimit   Int?
  tenantId    String
  questions   Question[]
  attempts    QuizAttempt[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  @@index([tenantId])
  @@index([measureId])
}

model Question {
  id            String   @id @default(cuid())
  quizId        String
  quiz          Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  question      String
  optionA       String
  optionB       String
  optionC       String
  optionD       String?
  correctAnswer String
  points        Int      @default(1)
  topic         String?
  tenantId      String
  @@index([quizId])
  @@index([tenantId])
}

model QuizAttempt {
  id            String   @id @default(cuid())
  quizId        String
  quiz          Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  participantId String
  score         Int
  total         Int
  passed        Boolean
  answers       Json
  tenantId      String
  createdAt     DateTime @default(now())
  @@index([quizId])
  @@index([participantId])
  @@index([tenantId])
}`;

c = c + '\n' + models;
fs.writeFileSync('prisma/schema.prisma', c, 'utf8');
console.log('DONE');
console.log('Has Quiz:', c.includes('model Quiz'));
