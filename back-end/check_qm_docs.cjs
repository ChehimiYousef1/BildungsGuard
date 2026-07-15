const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.document.findMany({ 
  where: { type: 'QM_DOC' },
  select: { id: true, participantId: true, measureId: true, responsible: true, notes: true },
  take: 3
}).then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
