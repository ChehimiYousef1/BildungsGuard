const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.survey.findMany({ 
  where: { participantId: 'cmr6q0yp0000112niygj02jxe' },
  select: { id: true, type: true, title: true, score: true, participantId: true }
}).then(r => { console.log(JSON.stringify(r, null, 2)); return prisma.$disconnect(); });
