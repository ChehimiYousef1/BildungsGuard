const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.survey.deleteMany({ 
  where: { participantId: 'cmr5b2iaz000a39m6qs7n70fp', type: 'test' }
}).then(r => { console.log('Deleted:', r.count); return prisma.$disconnect(); });
