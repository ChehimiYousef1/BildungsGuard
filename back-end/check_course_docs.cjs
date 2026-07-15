const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.document.findFirst({ 
  where: { type: 'COURSE_RECORD' },
  select: { id: true, type: true, participantId: true, measureId: true, responsible: true }
}).then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
